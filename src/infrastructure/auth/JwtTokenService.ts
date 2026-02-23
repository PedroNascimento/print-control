import { ITokenService, TokenPayload } from '@/application/interfaces/ITokenService';
import jwt from 'jsonwebtoken';

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret?: string, expiresIn?: string) {
    this.secret = secret ?? process.env.JWT_SECRET ?? 'default-secret';
    this.expiresIn = expiresIn ?? process.env.JWT_EXPIRES_IN ?? '24h';
  }

  generate(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return { userId: decoded.userId, email: decoded.email };
    } catch {
      return null;
    }
  }
}
