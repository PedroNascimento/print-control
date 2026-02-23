import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

export class DeleteInvestmentUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const investment = await this.investmentRepo.findById(id, userId);
    if (!investment) {
      throw new EntityNotFoundError('Investment', id);
    }
    await this.investmentRepo.delete(id, userId);
  }
}
