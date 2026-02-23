import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { DateRange } from '@/domain/value-objects/DateRange';
import { InvestmentOutputDTO, toInvestmentOutput } from '@/application/dtos/investment/InvestmentOutputDTO';

export class ListInvestmentByPeriodUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(userId: string, startDate: Date, endDate: Date): Promise<InvestmentOutputDTO[]> {
    const range = DateRange.create(startDate, endDate);
    const investments = await this.investmentRepo.findByPeriod(userId, range);
    return investments.map(toInvestmentOutput);
  }
}
