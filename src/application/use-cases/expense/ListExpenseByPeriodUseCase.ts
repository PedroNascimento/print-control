import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { DateRange } from '@/domain/value-objects/DateRange';
import { ExpenseOutputDTO, toExpenseOutput } from '@/application/dtos/expense/ExpenseOutputDTO';

export class ListExpenseByPeriodUseCase {
  constructor(private readonly expenseRepo: IExpenseRepository) {}

  async execute(userId: string, startDate: Date, endDate: Date): Promise<ExpenseOutputDTO[]> {
    const range = DateRange.create(startDate, endDate);
    const expenses = await this.expenseRepo.findByPeriod(userId, range);
    return expenses.map(toExpenseOutput);
  }
}
