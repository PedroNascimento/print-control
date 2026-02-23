import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { ValidateTokenUseCase } from '@/application/use-cases/auth/ValidateTokenUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { CreateRevenueUseCase } from '@/application/use-cases/revenue/CreateRevenueUseCase';
import { ListRevenueByPeriodUseCase } from '@/application/use-cases/revenue/ListRevenueByPeriodUseCase';
import { DeleteRevenueUseCase } from '@/application/use-cases/revenue/DeleteRevenueUseCase';
import { CreateExpenseUseCase } from '@/application/use-cases/expense/CreateExpenseUseCase';
import { ListExpenseByPeriodUseCase } from '@/application/use-cases/expense/ListExpenseByPeriodUseCase';
import { DeleteExpenseUseCase } from '@/application/use-cases/expense/DeleteExpenseUseCase';
import { CreateInvestmentUseCase } from '@/application/use-cases/investment/CreateInvestmentUseCase';
import { ListInvestmentByPeriodUseCase } from '@/application/use-cases/investment/ListInvestmentByPeriodUseCase';
import { DeleteInvestmentUseCase } from '@/application/use-cases/investment/DeleteInvestmentUseCase';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';
import { PrismaRevenueRepository } from '@/infrastructure/repositories/PrismaRevenueRepository';
import { PrismaExpenseRepository } from '@/infrastructure/repositories/PrismaExpenseRepository';
import { PrismaInvestmentRepository } from '@/infrastructure/repositories/PrismaInvestmentRepository';
import { BcryptHashService } from '@/infrastructure/auth/BcryptHashService';
import { JwtTokenService } from '@/infrastructure/auth/JwtTokenService';
import { createAuthMiddleware } from '@/presentation/middlewares/AuthMiddleware';

// ─── Infrastructure Singletons ────────────────────────────────────────
const userRepository = new PrismaUserRepository();
const revenueRepository = new PrismaRevenueRepository();
const expenseRepository = new PrismaExpenseRepository();
const investmentRepository = new PrismaInvestmentRepository();
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService();

// ─── Auth Use Cases ───────────────────────────────────────────────────
const loginUseCase = new LoginUseCase(userRepository, hashService, tokenService);
const registerUseCase = new RegisterUseCase(userRepository, hashService, tokenService);
const validateTokenUseCase = new ValidateTokenUseCase(tokenService);

// ─── Revenue Use Cases ────────────────────────────────────────────────
const createRevenueUseCase = new CreateRevenueUseCase(revenueRepository);
const listRevenueByPeriodUseCase = new ListRevenueByPeriodUseCase(revenueRepository);
const deleteRevenueUseCase = new DeleteRevenueUseCase(revenueRepository);

// ─── Expense Use Cases ────────────────────────────────────────────────
const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository);
const listExpenseByPeriodUseCase = new ListExpenseByPeriodUseCase(expenseRepository);
const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository);

// ─── Investment Use Cases ─────────────────────────────────────────────
const createInvestmentUseCase = new CreateInvestmentUseCase(investmentRepository);
const listInvestmentByPeriodUseCase = new ListInvestmentByPeriodUseCase(investmentRepository);
const deleteInvestmentUseCase = new DeleteInvestmentUseCase(investmentRepository);

// ─── Middleware ───────────────────────────────────────────────────────
const authMiddleware = createAuthMiddleware(validateTokenUseCase);

// ─── Exports ──────────────────────────────────────────────────────────
export {
  // Auth
  loginUseCase,
  registerUseCase,
  validateTokenUseCase,
  authMiddleware,
  // Revenue
  createRevenueUseCase,
  listRevenueByPeriodUseCase,
  deleteRevenueUseCase,
  // Expense
  createExpenseUseCase,
  listExpenseByPeriodUseCase,
  deleteExpenseUseCase,
  // Investment
  createInvestmentUseCase,
  listInvestmentByPeriodUseCase,
  deleteInvestmentUseCase,
  // Repositories (for advanced use)
  revenueRepository,
  expenseRepository,
  investmentRepository,
};
