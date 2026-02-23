import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { DateRange } from '@/domain/value-objects/DateRange';
import { RevenueOutputDTO, toRevenueOutput } from '@/application/dtos/revenue/RevenueOutputDTO';

export class ListRevenueByPeriodUseCase {
  constructor(private readonly revenueRepo: IRevenueRepository) {}

  async execute(userId: string, year: number, month: number): Promise<RevenueOutputDTO[]> {
    const range = DateRange.forMonth(year, month);
    const revenues = await this.revenueRepo.findByPeriod(userId, range);
    return revenues.map(toRevenueOutput);
  }
}
