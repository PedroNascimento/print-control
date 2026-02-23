import { InvestmentType } from '@/domain/enums/InvestmentType';

export interface CreateInvestmentDTO {
  description: string;
  valueCents: number;
  date: string;
  type: InvestmentType;
  userId: string;
  observation?: string;
}
