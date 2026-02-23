import { Investment } from '@/domain/entities/Investment';

export interface InvestmentOutputDTO {
  id: string;
  description: string;
  valueCents: number;
  valueReais: number;
  date: string;
  type: string;
  observation?: string;
  createdAt: string;
}

export function toInvestmentOutput(investment: Investment): InvestmentOutputDTO {
  return {
    id: investment.id,
    description: investment.description,
    valueCents: investment.value.amount,
    valueReais: investment.value.inReais,
    date: investment.date.toISOString(),
    type: investment.type,
    observation: investment.observation,
    createdAt: investment.createdAt.toISOString(),
  };
}
