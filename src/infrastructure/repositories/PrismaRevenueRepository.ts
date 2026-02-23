import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { Revenue } from '@/domain/entities/Revenue';
import { Money } from '@/domain/value-objects/Money';
import { DateRange } from '@/domain/value-objects/DateRange';
import { RevenueType } from '@/domain/enums/RevenueType';
import { prisma } from '../database/PrismaClient';

type PrismaRevenue = {
  id: string;
  description: string;
  valueCents: number;
  date: Date;
  type: string;
  userId: string;
  client: string | null;
  costCents: number | null;
  expenseReferenceId: string | null;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaRevenueRepository implements IRevenueRepository {
  async create(revenue: Revenue): Promise<void> {
    await prisma.revenue.create({
      data: {
        id: revenue.id,
        description: revenue.description,
        valueCents: revenue.value.amount,
        date: revenue.date,
        type: revenue.type,
        userId: revenue.userId,
        client: revenue.client ?? null,
        costCents: revenue.cost?.amount ?? null,
        expenseReferenceId: revenue.expenseReferenceId ?? null,
        observation: revenue.observation ?? null,
      },
    });
  }

  async findById(id: string, userId: string): Promise<Revenue | null> {
    const data = await prisma.revenue.findFirst({
      where: { id, userId },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findByPeriod(userId: string, range: DateRange): Promise<Revenue[]> {
    const data = await prisma.revenue.findMany({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      orderBy: { date: 'desc' },
    });
    return data.map((r) => this.toDomain(r));
  }

  async getTotalByPeriod(userId: string, range: DateRange): Promise<Money> {
    const result = await prisma.revenue.aggregate({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      _sum: { valueCents: true },
    });
    return Money.fromCents(result._sum.valueCents ?? 0);
  }

  async linkToExpense(revenueId: string, expenseId: string): Promise<void> {
    await prisma.revenue.update({
      where: { id: revenueId },
      data: { expenseReferenceId: expenseId },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.revenue.deleteMany({
      where: { id, userId },
    });
  }

  private toDomain(data: PrismaRevenue): Revenue {
    return new Revenue({
      id: data.id,
      description: data.description,
      value: Money.fromCents(data.valueCents),
      date: data.date,
      type: data.type as RevenueType,
      userId: data.userId,
      client: data.client ?? undefined,
      cost: data.costCents ? Money.fromCents(data.costCents) : undefined,
      expenseReferenceId: data.expenseReferenceId ?? undefined,
      observation: data.observation ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
