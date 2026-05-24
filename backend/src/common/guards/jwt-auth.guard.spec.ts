import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// We must import our guard after mocking passport's AuthGuard,
// because JwtAuthGuard extends AuthGuard('jwt') which immediately
// tries to resolve the 'jwt' passport strategy at class-definition time.
jest.mock('@nestjs/passport', () => {
  class MockAuthGuard {
    canActivate(_context: ExecutionContext) {
      return true;
    }
  }
  return {
    AuthGuard: () => MockAuthGuard,
  };
});

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflectorMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
    guard = new JwtAuthGuard(reflectorMock);
  });

  afterEach(() => jest.clearAllMocks());

  function createMockContext(): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({}),
        getNext: jest.fn(),
      }),
    } as any;
  }

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should delegate to parent AuthGuard for non-public routes', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext();

      // When not public, canActivate delegates to super.canActivate
      // which is our MockAuthGuard that returns true
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should delegate to parent when IS_PUBLIC_KEY is undefined', () => {
      reflectorMock.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext();

      const result = guard.canActivate(context);

      // Undefined is falsy, so it goes to super.canActivate
      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return the user when valid', () => {
      const mockUser = { sub: 'user-1', email: 'a@b.com' };
      const result = guard.handleRequest(null, mockUser, null);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow('Unauthorized');
    });

    it('should throw the original error when err is provided', () => {
      const originalError = new Error('Token expired');
      expect(() => guard.handleRequest(originalError, null, null)).toThrow('Token expired');
    });

    it('should throw the original error even when user is provided but err exists', () => {
      const err = new Error('Forced error');
      expect(() => guard.handleRequest(err, { sub: 'user-1' }, null)).toThrow('Forced error');
    });
  });
});
