import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateInvestmentUseCase } from '@/application/use-cases/investment/CreateInvestmentUseCase';
import { ListInvestmentByPeriodUseCase } from '@/application/use-cases/investment/ListInvestmentByPeriodUseCase';
import { DeleteInvestmentUseCase } from '@/application/use-cases/investment/DeleteInvestmentUseCase';
import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { Investment } from '@/domain/entities/Investment';
import { Money } from '@/domain/value-objects/Money';
import { InvestmentType } from '@/domain/enums/InvestmentType';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

describe('Investment Use Cases', () => {
  let mockRepo: IInvestmentRepository;

  const testInvestment = new Investment({
    id: 'inv-1',
    description: 'Impressora Epson',
    value: Money.fromCents(150000),
    date: new Date('2025-01-10'),
    type: InvestmentType.EQUIPMENT,
    userId: 'user-1',
  });

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPeriod: vi.fn(),
      getTotal: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateInvestmentUseCase', () => {
    it('should create an investment and return output DTO', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(undefined);

      const useCase = new CreateInvestmentUseCase(mockRepo);
      const result = await useCase.execute({
        description: 'Impressora Epson',
        valueCents: 150000,
        date: '2025-01-10',
        type: InvestmentType.EQUIPMENT,
        userId: 'user-1',
      });

      expect(result.description).toBe('Impressora Epson');
      expect(result.valueCents).toBe(150000);
      expect(result.valueReais).toBe(1500);
      expect(result.type).toBe(InvestmentType.EQUIPMENT);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('ListInvestmentByPeriodUseCase', () => {
    it('should list investments for a given month', async () => {
      vi.mocked(mockRepo.findByPeriod).mockResolvedValue([testInvestment]);

      const useCase = new ListInvestmentByPeriodUseCase(mockRepo);
      const startDate = new Date('2025-01-01T00:00:00');
      const endDate = new Date('2025-01-31T23:59:59');
      const result = await useCase.execute('user-1', startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('inv-1');
      expect(result[0].valueReais).toBe(1500);
    });
  });

  describe('DeleteInvestmentUseCase', () => {
    it('should delete an existing investment', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(testInvestment);

      const useCase = new DeleteInvestmentUseCase(mockRepo);
      await useCase.execute('inv-1', 'user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('inv-1', 'user-1');
    });

    it('should throw EntityNotFoundError if not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const useCase = new DeleteInvestmentUseCase(mockRepo);

      await expect(useCase.execute('nope', 'user-1')).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });
});
