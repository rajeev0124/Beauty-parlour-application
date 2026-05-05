/**
 * Enhanced Auth Service Unit Tests
 * Comprehensive tests for authentication service covering all methods and edge cases
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../../schemas/user.schema';
import { UserFixtures } from '../../../../test/fixtures/users.fixture';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../../email/email.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModel: any;
  let createQueryMock: (resolvedValue: any) => any;

  beforeEach(async () => {
    // Helper to create a chainable mock query
    createQueryMock = (resolvedValue: any) => {
      const query: any = Promise.resolve(resolvedValue);
      query.select = jest.fn().mockReturnThis();
      query.sort = jest.fn().mockReturnThis();
      query.exec = jest.fn().mockResolvedValue(resolvedValue);
      return query;
    };

    // Create mock user model
    userModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
    };

    userModel.findOne.mockImplementation(() => createQueryMock(null));
    userModel.findById.mockImplementation(() => createQueryMock(null));
    userModel.findByIdAndUpdate.mockImplementation(() => createQueryMock(null));

    // Create mock JWT service
    const mockJwtService = {
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockEmailService = {
      sendPasswordReset: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    // Add this helper to the test scope
    (this as any).createQueryMock = createQueryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== REGISTER TESTS =====
  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = UserFixtures.VALID_REGISTER_DTO;

      // Setup mocks
      userModel.findOne.mockImplementation(() => createQueryMock(null)); // Email doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const createdUser = {
        ...registerDto,
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        password: 'hashedPassword',
        role: 'customer',
        status: 'active',
        refreshToken: null,
        save: jest.fn().mockResolvedValue(true),
        toObject: function () {
          return {
            _id: this._id.toString(),
            name: this.name,
            email: this.email,
            phone: this.phone,
            role: this.role,
            status: this.status,
          };
        },
      };

      userModel.create.mockResolvedValue(createdUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(createdUser),
      );

      // Execute
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerDto.email,
      });
      // Hash is called twice: once for password, once for refreshToken
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = UserFixtures.VALID_REGISTER_DTO;

      // Email already exists
      userModel.findOne.mockImplementation(() =>
        createQueryMock(UserFixtures.CUSTOMER_USER),
      );

      // Execute & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const weakPasswordDto = {
        ...UserFixtures.VALID_REGISTER_DTO,
        password: '123',
      };

      userModel.findOne.mockImplementation(() => createQueryMock(null));

      // Execute & Assert
      await expect(service.register(weakPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(weakPasswordDto)).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });

    it('should throw error if email validation fails', async () => {
      const invalidEmailDto = UserFixtures.INVALID_EMAIL_REGISTER_DTO;

      // Execute & Assert
      await expect(service.register(invalidEmailDto)).rejects.toThrow();
    });

    it('should set role to customer by default', async () => {
      const registerDto = UserFixtures.VALID_REGISTER_DTO;

      userModel.findOne.mockImplementation(() => createQueryMock(null));
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const createdUser = {
        ...registerDto,
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        password: 'hashedPassword',
        role: 'customer', // Default role
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };

      userModel.create.mockResolvedValue(createdUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(createdUser),
      );

      // Execute
      await service.register(registerDto);

      // Assert - user should be created with customer role
      const createCall = userModel.create.mock.calls[0][0];
      expect(createCall.role).toBe('customer');
    });
  });

  // ===== LOGIN TESTS =====
  describe('login', () => {
    it('should successfully login user and return tokens', async () => {
      const loginDto = UserFixtures.VALID_LOGIN_DTO;

      // Setup mocks
      const user = {
        ...UserFixtures.CUSTOMER_USER,
        toObject: function () {
          return { ...this };
        },
      };

      userModel.findOne.mockImplementation(() => createQueryMock(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password matches

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');
      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(user),
      );

      // Execute
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = UserFixtures.INVALID_EMAIL_LOGIN_DTO;

      userModel.findOne.mockImplementation(() => createQueryMock(null)); // User not found

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = UserFixtures.INVALID_PASSWORD_LOGIN_DTO;

      userModel.findOne.mockImplementation(() =>
        createQueryMock(UserFixtures.CUSTOMER_USER),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password doesn't match

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is blocked', async () => {
      const loginDto = UserFixtures.VALID_LOGIN_DTO;

      const blockedUser = {
        ...UserFixtures.BLOCKED_USER,
        email: loginDto.email,
        password: UserFixtures.BLOCKED_USER.password,
      };

      userModel.findOne.mockImplementation(() => createQueryMock(blockedUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update refresh token in database', async () => {
      const loginDto = UserFixtures.VALID_LOGIN_DTO;
      const user = UserFixtures.CUSTOMER_USER;

      userModel.findOne.mockImplementation(() => createQueryMock(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(user),
      );

      // Execute
      await service.login(loginDto);

      // Assert - refresh token should be updated (it's hashed, so we check findByIdAndUpdate was called)
      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  // ===== LOGOUT TESTS =====
  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      const userId = '507f1f77bcf86cd799439011';

      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(UserFixtures.CUSTOMER_USER),
      );

      // Execute
      const result = await service.logout(userId);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  // ===== PASSWORD RESET TESTS =====
  describe('forgotPassword', () => {
    it('should generate reset token and send email', async () => {
      const forgotPasswordDto = UserFixtures.VALID_FORGOT_PASSWORD_DTO;
      const user = {
        ...UserFixtures.CUSTOMER_USER,
        save: jest.fn().mockResolvedValue(true),
      };

      userModel.findOne.mockImplementation(() => createQueryMock(user));
      userModel.findByIdAndUpdate.mockImplementation(() =>
        createQueryMock(user),
      );

      // Execute
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toHaveProperty('message');
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: forgotPasswordDto.email,
      });
      // Verify reset token was set
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw error if email not found', async () => {
      const forgotPasswordDto = UserFixtures.VALID_FORGOT_PASSWORD_DTO;

      userModel.findOne.mockImplementation(() => createQueryMock(null));

      // Execute & Assert
      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        'This email address is not registered. Please check your email or create a new account.',
      );
    });
  });

  // ===== REFRESH TOKEN TESTS =====
  describe('refreshToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'validRefreshToken' };
      const user = {
        ...UserFixtures.CUSTOMER_USER,
        refreshToken: 'hashedRefreshToken',
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: user._id.toString(),
      });
      userModel.findById.mockImplementation(() => createQueryMock(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      // Execute
      const result = await service.refreshToken(refreshTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        expect.any(Object),
      );
    });

    it('should throw error if refresh token is invalid', async () => {
      const refreshTokenDto = { refreshToken: 'invalidToken' };

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      // Execute & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow();
    });

    it('should throw error if refresh token does not match stored token', async () => {
      const refreshTokenDto = { refreshToken: 'differentToken' };
      const user = {
        ...UserFixtures.CUSTOMER_USER,
        refreshToken: 'storedToken',
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: user._id.toString(),
      });
      userModel.findById.mockImplementation(() => createQueryMock(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Execute & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow();
    });
  });

  // ===== GET PROFILE TESTS =====
  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const user = UserFixtures.CUSTOMER_USER;

      userModel.findById.mockImplementation(() => createQueryMock(user));

      // Execute
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toEqual(user);
      expect(userModel.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      const userId = 'nonexistent-id';

      userModel.findById.mockImplementation(() => createQueryMock(null));

      // Execute & Assert
      await expect(service.getProfile(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
