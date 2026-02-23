import { z } from 'zod';
import { RevenueType } from '@/domain/enums/RevenueType';
import { ExpenseType } from '@/domain/enums/ExpenseType';
import { ExpenseCategory } from '@/domain/enums/ExpenseCategory';
import { InvestmentType } from '@/domain/enums/InvestmentType';

export const createRevenueSchema = z.object({
  description: z.string().min(2, 'Descrição obrigatória'),
  valueCents: z.number().int().positive('Valor deve ser positivo'),
  date: z.string().datetime({ message: 'Data inválida' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')),
  type: z.nativeEnum(RevenueType, { error: 'Tipo de receita inválido' }),
  client: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
  expenseReferenceId: z.string().uuid().optional(),
  observation: z.string().optional(),
});

export const createExpenseSchema = z.object({
  description: z.string().min(2, 'Descrição obrigatória'),
  valueCents: z.number().int().positive('Valor deve ser positivo'),
  date: z.string().datetime({ message: 'Data inválida' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')),
  category: z.nativeEnum(ExpenseCategory, { error: 'Categoria inválida' }),
  type: z.nativeEnum(ExpenseType, { error: 'Tipo de despesa inválido' }),
  paymentMethod: z.string().optional(),
  observation: z.string().optional(),
});

export const createInvestmentSchema = z.object({
  description: z.string().min(2, 'Descrição obrigatória'),
  valueCents: z.number().int().positive('Valor deve ser positivo'),
  date: z.string().datetime({ message: 'Data inválida' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')),
  type: z.nativeEnum(InvestmentType, { error: 'Tipo de investimento inválido' }),
  observation: z.string().optional(),
});

// Legacy: month-based period (used by summary dashboard)
export const periodQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

// New: flexible date range (used by CRUD list pages)
export const dateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
});
