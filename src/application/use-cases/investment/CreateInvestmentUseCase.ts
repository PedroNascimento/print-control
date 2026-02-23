import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { Investment } from '@/domain/entities/Investment';
import { Money } from '@/domain/value-objects/Money';
import { CreateInvestmentDTO } from '@/application/dtos/investment/CreateInvestmentDTO';
import { InvestmentOutputDTO, toInvestmentOutput } from '@/application/dtos/investment/InvestmentOutputDTO';
import { v4 as uuidv4 } from 'uuid';

export class CreateInvestmentUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(input: CreateInvestmentDTO): Promise<InvestmentOutputDTO> {
    const investment = new Investment({
      id: uuidv4(),
      description: input.description,
      value: Money.fromCents(input.valueCents),
      date: new Date(input.date),
      type: input.type,
      userId: input.userId,
      observation: input.observation,
    });

    await this.investmentRepo.create(investment);
    return toInvestmentOutput(investment);
  }
}
