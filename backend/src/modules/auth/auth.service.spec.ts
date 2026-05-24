import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let prismaServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        const map: Record<string, string> = {
          'jwt.accessSecret': 'access-secret',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.accessExpiresIn': '15m',
          'jwt.refreshExpiresIn': '30d',
        };
        return map[key];
      }),
    };

    prismaServiceMock = {
      organization: { create: jest.fn() },
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      usersServiceMock.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
      });
      jwtServiceMock.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      prismaServiceMock.refreshToken.create.mockResolvedValue({});
      prismaServiceMock.organization.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed-pw',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(prismaServiceMock.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'John Workspace',
            slug: 'user-user-1',
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'pw',
          firstName: 'A',
          lastName: 'B',
        }),
      ).rejects.toThrow('Email already exists');
    });

    it('should use "Personal" as org name when firstName is falsy', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      usersServiceMock.create.mockResolvedValue({
        id: 'user-2',
        email: 'no-name@example.com',
        firstName: null,
      });
      jwtServiceMock.sign.mockReturnValue('token');
      prismaServiceMock.refreshToken.create.mockResolvedValue({});
      prismaServiceMock.organization.create.mockResolvedValue({});

      await service.register({
        email: 'no-name@example.com',
        password: 'pw',
        firstName: '',
        lastName: '',
      });

      expect(prismaServiceMock.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Personal Workspace',
          }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-pw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      prismaServiceMock.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'pw' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-pw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if user has no passwordHash', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: null,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'pw' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should rotate tokens when refresh token is valid', async () => {
      jwtServiceMock.verify.mockReturnValue({ sub: 'user-1', email: 'a@b.com' });
      prismaServiceMock.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', tokenHash: 'hash-1' },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaServiceMock.refreshToken.update.mockResolvedValue({});
      jwtServiceMock.sign
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-refresh');
      prismaServiceMock.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('old-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      expect(prismaServiceMock.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if no stored token matches', async () => {
      jwtServiceMock.verify.mockReturnValue({ sub: 'user-1', email: 'a@b.com' });
      prismaServiceMock.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', tokenHash: 'hash-1' },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('bad-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if jwt.verify fails', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should revoke all active refresh tokens for the user', async () => {
      prismaServiceMock.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      await service.logout('user-1');

      expect(prismaServiceMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
