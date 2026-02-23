import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateExpenseUseCase } from '@/application/use-cases/expense/CreateExpenseUseCase';
import { ListExpenseByPeriodUseCase } from '@/application/use-cases/expense/ListExpenseByPeriodUseCase';
import { DeleteExpenseUseCase } from '@/application/use-cases/expense/DeleteExpenseUseCase';
import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { Expense } from '@/domain/entities/Expense';
import { Money } from '@/domain/value-objects/Money';
import { ExpenseType } from '@/domain/enums/ExpenseType';
import { ExpenseCategory } from '@/domain/enums/ExpenseCategory';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

describe('Expense Use Cases', () => {
  let mockRepo: IExpenseRepository;

  const testExpense = new Expense({
    id: 'exp-1',
    description: 'Compra de tinta',
    value: Money.fromCents(3000),
    date: new Date('2025-02-10'),
    category: ExpenseCategory.SUPPLIES,
    type: ExpenseType.OPERATIONAL,
    userId: 'user-1',
  });

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPeriod: vi.fn(),
      getTotalByPeriod: vi.fn(),
      getByCategory: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateExpenseUseCase', () => {
    it('should create an expense and return output DTO', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(undefined);

      const useCase = new CreateExpenseUseCase(mockRepo);
      const result = await useCase.execute({
        description: 'Compra de tinta',
        valueCents: 3000,
        date: '2025-02-10',
        category: ExpenseCategory.SUPPLIES,
        type: ExpenseType.OPERATIONAL,
        userId: 'user-1',
      });

      expect(result.description).toBe('Compra de tinta');
      expect(result.valueCents).toBe(3000);
      expect(result.valueReais).toBe(30);
      expect(result.category).toBe(ExpenseCategory.SUPPLIES);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('ListExpenseByPeriodUseCase', () => {
    it('should list expenses for a given month', async () => {
      vi.mocked(mockRepo.findByPeriod).mockResolvedValue([testExpense]);

      const useCase = new ListExpenseByPeriodUseCase(mockRepo);
      const result = await useCase.execute('user-1', 2025, 2);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exp-1');
    });
  });

  describe('DeleteExpenseUseCase', () => {
    it('should delete an existing expense', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(testExpense);

      const useCase = new DeleteExpenseUseCase(mockRepo);
      await useCase.execute('exp-1', 'user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('exp-1', 'user-1');
    });

    it('should throw EntityNotFoundError if not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const useCase = new DeleteExpenseUseCase(mockRepo);

      await expect(useCase.execute('nope', 'user-1')).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });
});
