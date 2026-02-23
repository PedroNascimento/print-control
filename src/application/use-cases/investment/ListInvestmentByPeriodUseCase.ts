import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { DateRange } from '@/domain/value-objects/DateRange';
import { InvestmentOutputDTO, toInvestmentOutput } from '@/application/dtos/investment/InvestmentOutputDTO';

export class ListInvestmentByPeriodUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(userId: string, year: number, month: number): Promise<InvestmentOutputDTO[]> {
    const range = DateRange.forMonth(year, month);
    const investments = await this.investmentRepo.findByPeriod(userId, range);
    return investments.map(toInvestmentOutput);
  }
}
