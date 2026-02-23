import { RevenueType } from '@/domain/enums/RevenueType';

export interface CreateRevenueDTO {
  description: string;
  valueCents: number;
  date: string;
  type: RevenueType;
  userId: string;
  client?: string;
  costCents?: number;
  expenseReferenceId?: string;
  observation?: string;
}
