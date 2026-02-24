import { Revenue } from '../entities/Revenue';
import { Money } from '../value-objects/Money';
import { DateRange } from '../value-objects/DateRange';

export interface IRevenueRepository {
  create(revenue: Revenue): Promise<void>;
  findById(id: string, userId: string): Promise<Revenue | null>;
  findByPeriod(userId: string, range: DateRange): Promise<Revenue[]>;
  getTotalByPeriod(userId: string, range: DateRange): Promise<Money>;
  getGrossProfitByPeriod(userId: string, range: DateRange): Promise<Money>;
  linkToExpense(revenueId: string, expenseId: string): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
}
