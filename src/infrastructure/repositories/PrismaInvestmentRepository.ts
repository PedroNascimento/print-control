import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { Investment } from '@/domain/entities/Investment';
import { Money } from '@/domain/value-objects/Money';
import { DateRange } from '@/domain/value-objects/DateRange';
import { InvestmentType } from '@/domain/enums/InvestmentType';
import { prisma } from '../database/PrismaClient';

type PrismaInvestment = {
  id: string;
  description: string;
  valueCents: number;
  date: Date;
  type: string;
  userId: string;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaInvestmentRepository implements IInvestmentRepository {
  async create(investment: Investment): Promise<void> {
    await prisma.investment.create({
      data: {
        id: investment.id,
        description: investment.description,
        valueCents: investment.value.amount,
        date: investment.date,
        type: investment.type,
        userId: investment.userId,
        observation: investment.observation ?? null,
      },
    });
  }

  async findById(id: string, userId: string): Promise<Investment | null> {
    const data = await prisma.investment.findFirst({
      where: { id, userId },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findByPeriod(userId: string, range: DateRange): Promise<Investment[]> {
    const data = await prisma.investment.findMany({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      orderBy: { date: 'desc' },
    });
    return data.map((i) => this.toDomain(i));
  }

  async getTotal(userId: string): Promise<Money> {
    const result = await prisma.investment.aggregate({
      where: { userId },
      _sum: { valueCents: true },
    });
    return Money.fromCents(result._sum.valueCents ?? 0);
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.investment.deleteMany({
      where: { id, userId },
    });
  }

  private toDomain(data: PrismaInvestment): Investment {
    return new Investment({
      id: data.id,
      description: data.description,
      value: Money.fromCents(data.valueCents),
      date: data.date,
      type: data.type as InvestmentType,
      userId: data.userId,
      observation: data.observation ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
