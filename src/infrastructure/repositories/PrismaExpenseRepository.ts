import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { Expense } from '@/domain/entities/Expense';
import { Money } from '@/domain/value-objects/Money';
import { DateRange } from '@/domain/value-objects/DateRange';
import { ExpenseType } from '@/domain/enums/ExpenseType';
import { ExpenseCategory } from '@/domain/enums/ExpenseCategory';
import { prisma } from '../database/PrismaClient';

type PrismaExpense = {
  id: string;
  description: string;
  valueCents: number;
  date: Date;
  category: string;
  type: string;
  userId: string;
  paymentMethod: string | null;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaExpenseRepository implements IExpenseRepository {
  async create(expense: Expense): Promise<void> {
    await prisma.expense.create({
      data: {
        id: expense.id,
        description: expense.description,
        valueCents: expense.value.amount,
        date: expense.date,
        category: expense.category,
        type: expense.type,
        userId: expense.userId,
        paymentMethod: expense.paymentMethod ?? null,
        observation: expense.observation ?? null,
      },
    });
  }

  async findById(id: string, userId: string): Promise<Expense | null> {
    const data = await prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findByPeriod(userId: string, range: DateRange): Promise<Expense[]> {
    const data = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      orderBy: { date: 'desc' },
    });
    return data.map((e) => this.toDomain(e));
  }

  async getTotalByPeriod(userId: string, range: DateRange): Promise<Money> {
    const result = await prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      _sum: { valueCents: true },
    });
    return Money.fromCents(result._sum.valueCents ?? 0);
  }

  async getByCategory(
    userId: string,
    range: DateRange,
  ): Promise<Map<ExpenseCategory, Money>> {
    const result = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: range.start, lte: range.end },
      },
      _sum: { valueCents: true },
    });

    const map = new Map<ExpenseCategory, Money>();
    for (const item of result) {
      map.set(
        item.category as ExpenseCategory,
        Money.fromCents(item._sum.valueCents ?? 0),
      );
    }
    return map;
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.expense.deleteMany({
      where: { id, userId },
    });
  }

  private toDomain(data: PrismaExpense): Expense {
    return new Expense({
      id: data.id,
      description: data.description,
      value: Money.fromCents(data.valueCents),
      date: data.date,
      category: data.category as ExpenseCategory,
      type: data.type as ExpenseType,
      userId: data.userId,
      paymentMethod: data.paymentMethod ?? undefined,
      observation: data.observation ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
