import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { Expense } from '@/domain/entities/Expense';
import { Money } from '@/domain/value-objects/Money';
import { CreateExpenseDTO } from '@/application/dtos/expense/CreateExpenseDTO';
import { ExpenseOutputDTO, toExpenseOutput } from '@/application/dtos/expense/ExpenseOutputDTO';
import { v4 as uuidv4 } from 'uuid';

export class CreateExpenseUseCase {
  constructor(private readonly expenseRepo: IExpenseRepository) {}

  async execute(input: CreateExpenseDTO): Promise<ExpenseOutputDTO> {
    const expense = new Expense({
      id: uuidv4(),
      description: input.description,
      value: Money.fromCents(input.valueCents),
      date: new Date(input.date),
      category: input.category,
      type: input.type,
      userId: input.userId,
      paymentMethod: input.paymentMethod,
      observation: input.observation,
    });

    await this.expenseRepo.create(expense);
    return toExpenseOutput(expense);
  }
}
