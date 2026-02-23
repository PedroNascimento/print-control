import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

export class DeleteRevenueUseCase {
  constructor(private readonly revenueRepo: IRevenueRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const revenue = await this.revenueRepo.findById(id, userId);
    if (!revenue) {
      throw new EntityNotFoundError('Revenue', id);
    }
    await this.revenueRepo.delete(id, userId);
  }
}
