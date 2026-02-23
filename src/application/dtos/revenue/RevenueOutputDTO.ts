import { Revenue } from '@/domain/entities/Revenue';

export interface RevenueOutputDTO {
  id: string;
  description: string;
  valueCents: number;
  valueReais: number;
  date: string;
  type: string;
  client?: string;
  costCents?: number;
  costReais?: number;
  grossProfitCents: number;
  grossProfitReais: number;
  expenseReferenceId?: string;
  observation?: string;
  createdAt: string;
}

export function toRevenueOutput(revenue: Revenue): RevenueOutputDTO {
  return {
    id: revenue.id,
    description: revenue.description,
    valueCents: revenue.value.amount,
    valueReais: revenue.value.inReais,
    date: revenue.date.toISOString(),
    type: revenue.type,
    client: revenue.client,
    costCents: revenue.cost?.amount,
    costReais: revenue.cost?.inReais,
    grossProfitCents: revenue.grossProfit.amount,
    grossProfitReais: revenue.grossProfit.inReais,
    expenseReferenceId: revenue.expenseReferenceId,
    observation: revenue.observation,
    createdAt: revenue.createdAt.toISOString(),
  };
}
