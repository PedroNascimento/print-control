import { Expense } from '../entities/Expense';
import { Money } from '../value-objects/Money';
import { DateRange } from '../value-objects/DateRange';
import { ExpenseCategory } from '../enums/ExpenseCategory';

export interface IExpenseRepository {
  create(expense: Expense): Promise<void>;
  findById(id: string, userId: string): Promise<Expense | null>;
  findByPeriod(userId: string, range: DateRange): Promise<Expense[]>;
  getTotalByPeriod(userId: string, range: DateRange): Promise<Money>;
  getByCategory(userId: string, range: DateRange): Promise<Map<ExpenseCategory, Money>>;
  delete(id: string, userId: string): Promise<void>;
}
