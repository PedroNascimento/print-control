import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { Revenue } from '@/domain/entities/Revenue';
import { Money } from '@/domain/value-objects/Money';
import { CreateRevenueDTO } from '@/application/dtos/revenue/CreateRevenueDTO';
import { RevenueOutputDTO, toRevenueOutput } from '@/application/dtos/revenue/RevenueOutputDTO';
import { v4 as uuidv4 } from 'uuid';

export class CreateRevenueUseCase {
  constructor(private readonly revenueRepo: IRevenueRepository) {}

  async execute(input: CreateRevenueDTO): Promise<RevenueOutputDTO> {
    const revenue = new Revenue({
      id: uuidv4(),
      description: input.description,
      value: Money.fromCents(input.valueCents),
      date: new Date(input.date),
      type: input.type,
      userId: input.userId,
      client: input.client,
      cost: input.costCents ? Money.fromCents(input.costCents) : undefined,
      expenseReferenceId: input.expenseReferenceId,
      observation: input.observation,
    });

    await this.revenueRepo.create(revenue);
    return toRevenueOutput(revenue);
  }
}
