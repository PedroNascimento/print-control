import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { Revenue } from '@/domain/entities/Revenue';
import { RevenueItem } from '@/domain/entities/RevenueItem';
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
  items?: {
    id: string;
    revenueId: string;
    serviceId: string | null;
    quantity: number;
    unitPrice: number;
    unitCost: number | null;
    totalPrice: number;
    service?: { name: string } | null;
  }[];
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
        ...(revenue.items && revenue.items.length > 0 && {
          items: {
            create: revenue.items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice.amount,
              unitCost: item.unitCost?.amount,
              totalPrice: item.totalPrice.amount,
              serviceId: item.serviceId,
            }))
          }
        })
      },
    });
  }

  async findById(id: string, userId: string): Promise<Revenue | null> {
    const data = await prisma.revenue.findFirst({
      where: { id, userId },
      include: { items: { include: { service: { select: { name: true } } } } }
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
      include: { items: { include: { service: { select: { name: true } } } } },
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

  async getGrossProfitByPeriod(userId: string, range: DateRange): Promise<Money> {
    const result = await prisma.revenue.aggregate({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      _sum: { valueCents: true, costCents: true },
    });
    const totalValue = result._sum.valueCents ?? 0;
    const totalCost = result._sum.costCents ?? 0;
    return Money.fromCents(totalValue - totalCost);
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
    const model = new Revenue({
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
      items: data.items?.map(i => new RevenueItem({
        id: i.id,
        revenueId: i.revenueId,
        serviceId: i.serviceId ?? undefined,
        quantity: i.quantity,
        unitPrice: Money.fromCents(i.unitPrice),
        unitCost: i.unitCost !== null ? Money.fromCents(i.unitCost) : undefined,
        totalPrice: Money.fromCents(i.totalPrice),
      })),
    }) as Revenue & { itemsData?: any[] };

    // Hack: Attach the raw items and service names onto the returned entity, since the frontend needs it,
    // and Revenue output DTO usually maps the entity directly. Alternatively, we should do this via DTO.
    if (data.items) {
      (model as any)._rawItems = data.items;
    }

    return model;
  }
}
