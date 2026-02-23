import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { ValidateTokenUseCase } from '@/application/use-cases/auth/ValidateTokenUseCase';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';
import { BcryptHashService } from '@/infrastructure/auth/BcryptHashService';
import { JwtTokenService } from '@/infrastructure/auth/JwtTokenService';
import { createAuthMiddleware } from '@/presentation/middlewares/AuthMiddleware';

// ─── Infrastructure Singletons ────────────────────────────────────────
const userRepository = new PrismaUserRepository();
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService();

// ─── Use Cases ────────────────────────────────────────────────────────
const loginUseCase = new LoginUseCase(userRepository, hashService, tokenService);
const validateTokenUseCase = new ValidateTokenUseCase(tokenService);

// ─── Middleware ───────────────────────────────────────────────────────
const authMiddleware = createAuthMiddleware(validateTokenUseCase);

// ─── Exports ──────────────────────────────────────────────────────────
export {
  userRepository,
  hashService,
  tokenService,
  loginUseCase,
  validateTokenUseCase,
  authMiddleware,
};
