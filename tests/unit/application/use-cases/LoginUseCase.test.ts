import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IHashService } from '@/application/interfaces/IHashService';
import { ITokenService } from '@/application/interfaces/ITokenService';
import { User } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepo: IUserRepository;
  let mockHashService: IHashService;
  let mockTokenService: ITokenService;

  const testUser = new User({
    id: 'user-1',
    name: 'Pedro',
    email: Email.create('pedro@example.com'),
    passwordHash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    mockHashService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockTokenService = {
      generate: vi.fn(),
      verify: vi.fn(),
    };

    loginUseCase = new LoginUseCase(mockUserRepo, mockHashService, mockTokenService);
  });

  it('should login successfully with valid credentials', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(testUser);
    vi.mocked(mockHashService.compare).mockResolvedValue(true);
    vi.mocked(mockTokenService.generate).mockReturnValue('jwt-token-123');

    const result = await loginUseCase.execute({
      email: 'pedro@example.com',
      password: 'password123',
    });

    expect(result.token).toBe('jwt-token-123');
    expect(result.user.id).toBe('user-1');
    expect(result.user.name).toBe('Pedro');
    expect(result.user.email).toBe('pedro@example.com');

    expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockHashService.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(mockTokenService.generate).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'pedro@example.com',
    });
  });

  it('should throw UnauthorizedError when user is not found', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

    await expect(
      loginUseCase.execute({ email: 'notfound@example.com', password: 'any' }),
    ).rejects.toThrow(UnauthorizedError);

    expect(mockHashService.compare).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when password is wrong', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(testUser);
    vi.mocked(mockHashService.compare).mockResolvedValue(false);

    await expect(
      loginUseCase.execute({ email: 'pedro@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedError);

    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });
});
