import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/config/mail.config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

// Mock generateToken
jest.mock('src/utils/generateToken', () => ({
  generateToken: jest.fn(() => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;

  // Mock objects
  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-token'),
    verify: jest.fn(),
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GOOGLE_CLIENT_ID: 'mock-google-client-id',
        JWT_REFRESH_SECRET: 'mock-refresh-secret',
      };
      return config[key];
    }),
  };

  // Fake user data
  const mockUser: Partial<User> = {
    id: 'uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    auth_method: 'LOCAL',
    avarta: "mock-avarta",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // no existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue({
        ...registerDto,
        id: 'uuid-new',
        password: 'hashed-password',
        auth_method: 'LOCAL',
      });

      const result = await authService.register(registerDto);

      // Verify email duplicate check
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      // Verify welcome email was sent
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        registerDto.email,
        'Welcome to CineH7',
        expect.stringContaining(registerDto.name),
      );
      // Verify user was saved with hashed password
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed-password',
        auth_method: 'LOCAL',
      });
      // Verify return value
      expect(result).toHaveProperty('id', 'uuid-new');
      expect(result.auth_method).toBe('LOCAL');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser); // user already exists

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      // Should NOT hash or save
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'correctpassword',
    };

    it('should login successfully with correct credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      // Should return tokens and user info
      expect(result).toHaveProperty('access_token', 'mock-access-token');
      expect(result).toHaveProperty('refresh_token', 'mock-refresh-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        status: mockUser.status,
        avarta: mockUser.avarta,
      });
    });

    it('should throw UnauthorizedException if email not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // wrong password

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────
  describe('refresh', () => {
    it('should return a new access_token with a valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        email: 'test@example.com',
        sub: 'uuid-123',
      });
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await authService.refresh('valid-refresh-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'mock-refresh-secret',
      });
      expect(result).toEqual({ access_token: 'new-access-token' });
    });

    it('should throw UnauthorizedException for an invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(authService.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
