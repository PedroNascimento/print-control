import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRevenueUseCase } from '@/application/use-cases/revenue/CreateRevenueUseCase';
import { ListRevenueByPeriodUseCase } from '@/application/use-cases/revenue/ListRevenueByPeriodUseCase';
import { DeleteRevenueUseCase } from '@/application/use-cases/revenue/DeleteRevenueUseCase';
import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { Revenue } from '@/domain/entities/Revenue';
import { Money } from '@/domain/value-objects/Money';
import { RevenueType } from '@/domain/enums/RevenueType';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

describe('Revenue Use Cases', () => {
  let mockRepo: IRevenueRepository;

  const testRevenue = new Revenue({
    id: 'rev-1',
    description: 'Impressão para cliente X',
    value: Money.fromCents(5000),
    date: new Date('2025-02-15'),
    type: RevenueType.OWN,
    userId: 'user-1',
    client: 'Cliente X',
    cost: Money.fromCents(1000),
  });

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPeriod: vi.fn(),
      getTotalByPeriod: vi.fn(),
      linkToExpense: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateRevenueUseCase', () => {
    it('should create a revenue and return output DTO', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(undefined);

      const useCase = new CreateRevenueUseCase(mockRepo);
      const result = await useCase.execute({
        description: 'Impressão para cliente X',
        valueCents: 5000,
        date: '2025-02-15',
        type: RevenueType.OWN,
        userId: 'user-1',
        client: 'Cliente X',
        costCents: 1000,
      });

      expect(result.description).toBe('Impressão para cliente X');
      expect(result.valueCents).toBe(5000);
      expect(result.valueReais).toBe(50);
      expect(result.grossProfitCents).toBe(4000);
      expect(result.grossProfitReais).toBe(40);
      expect(result.client).toBe('Cliente X');
      expect(result.id).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('ListRevenueByPeriodUseCase', () => {
    it('should list revenues for a given month', async () => {
      vi.mocked(mockRepo.findByPeriod).mockResolvedValue([testRevenue]);

      const useCase = new ListRevenueByPeriodUseCase(mockRepo);
      const result = await useCase.execute('user-1', 2025, 2);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rev-1');
      expect(result[0].grossProfitCents).toBe(4000);
      expect(mockRepo.findByPeriod).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no revenues found', async () => {
      vi.mocked(mockRepo.findByPeriod).mockResolvedValue([]);

      const useCase = new ListRevenueByPeriodUseCase(mockRepo);
      const result = await useCase.execute('user-1', 2025, 1);

      expect(result).toHaveLength(0);
    });
  });

  describe('DeleteRevenueUseCase', () => {
    it('should delete an existing revenue', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(testRevenue);
      vi.mocked(mockRepo.delete).mockResolvedValue(undefined);

      const useCase = new DeleteRevenueUseCase(mockRepo);
      await useCase.execute('rev-1', 'user-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('rev-1', 'user-1');
      expect(mockRepo.delete).toHaveBeenCalledWith('rev-1', 'user-1');
    });

    it('should throw EntityNotFoundError if revenue does not exist', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const useCase = new DeleteRevenueUseCase(mockRepo);

      await expect(useCase.execute('not-found', 'user-1')).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
