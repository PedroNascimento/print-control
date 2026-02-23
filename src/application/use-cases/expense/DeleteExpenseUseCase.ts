import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepo: IExpenseRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const expense = await this.expenseRepo.findById(id, userId);
    if (!expense) {
      throw new EntityNotFoundError('Expense', id);
    }
    await this.expenseRepo.delete(id, userId);
  }
}
