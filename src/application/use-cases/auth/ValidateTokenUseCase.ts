import { ITokenService, TokenPayload } from '@/application/interfaces/ITokenService';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export class ValidateTokenUseCase {
  constructor(private readonly tokenService: ITokenService) {}

  execute(token: string): TokenPayload {
    const payload = this.tokenService.verify(token);

    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    return payload;
  }
}
