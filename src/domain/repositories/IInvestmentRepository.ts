import { Investment } from '../entities/Investment';
import { Money } from '../value-objects/Money';
import { DateRange } from '../value-objects/DateRange';

export interface IInvestmentRepository {
  create(investment: Investment): Promise<void>;
  findById(id: string, userId: string): Promise<Investment | null>;
  findByPeriod(userId: string, range: DateRange): Promise<Investment[]>;
  getTotal(userId: string): Promise<Money>;
  delete(id: string, userId: string): Promise<void>;
}
