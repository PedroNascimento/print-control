import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidateTokenUseCase } from '@/application/use-cases/auth/ValidateTokenUseCase';
import { ITokenService } from '@/application/interfaces/ITokenService';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

describe('ValidateTokenUseCase', () => {
  let validateTokenUseCase: ValidateTokenUseCase;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockTokenService = {
      generate: vi.fn(),
      verify: vi.fn(),
    };

    validateTokenUseCase = new ValidateTokenUseCase(mockTokenService);
  });

  it('should return payload for a valid token', () => {
    vi.mocked(mockTokenService.verify).mockReturnValue({
      userId: 'user-1',
      email: 'pedro@example.com',
    });

    const result = validateTokenUseCase.execute('valid-token');

    expect(result.userId).toBe('user-1');
    expect(result.email).toBe('pedro@example.com');
    expect(mockTokenService.verify).toHaveBeenCalledWith('valid-token');
  });

  it('should throw UnauthorizedError for an invalid token', () => {
    vi.mocked(mockTokenService.verify).mockReturnValue(null);

    expect(() => validateTokenUseCase.execute('invalid-token')).toThrow(
      UnauthorizedError,
    );
  });
});
