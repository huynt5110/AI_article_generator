import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaServiceMock: any;

  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return null when user not found by id', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createData = {
        email: 'new@example.com',
        passwordHash: 'hashed',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      const mockUser = { id: 'user-new', ...createData };
      prismaServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createData);

      expect(result).toEqual(mockUser);
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updatedUser = { id: 'user-1', firstName: 'Updated' };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', { firstName: 'Updated' });

      expect(result).toEqual(updatedUser);
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Updated' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaServiceMock.user.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('bad-id', { firstName: 'X' })).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('sanitize', () => {
    it('should return a UserResponseDto stripping sensitive fields', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'secret-hash-should-not-appear',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = service.sanitize(user as any);

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should handle null firstName/lastName gracefully', () => {
      const user = {
        id: 'user-2',
        email: 'no-name@example.com',
        firstName: null,
        lastName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.sanitize(user as any);

      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });
  });
});
