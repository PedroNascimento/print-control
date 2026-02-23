import { ExpenseType } from '@/domain/enums/ExpenseType';
import { ExpenseCategory } from '@/domain/enums/ExpenseCategory';

export interface CreateExpenseDTO {
  description: string;
  valueCents: number;
  date: string;
  category: ExpenseCategory;
  type: ExpenseType;
  userId: string;
  paymentMethod?: string;
  observation?: string;
}
