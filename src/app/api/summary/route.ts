import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, revenueRepository, expenseRepository, investmentRepository } from '@/main/container';
import { periodQuerySchema } from '@/presentation/validators/financialSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';
import { DateRange } from '@/domain/value-objects/DateRange';

export async function GET(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const query = periodQuerySchema.parse({
      year: searchParams.get('year'),
      month: searchParams.get('month'),
    });

    const range = DateRange.forMonth(query.year, query.month);
    const userId = auth.userId;

    const [totalRevenue, totalExpense, totalInvestment, categoryBreakdown] = await Promise.all([
      revenueRepository.getTotalByPeriod(userId, range),
      expenseRepository.getTotalByPeriod(userId, range),
      investmentRepository.getTotal(userId),
      expenseRepository.getByCategory(userId, range),
    ]);

    const netProfit = totalRevenue.subtract(totalExpense);
    const profitMargin = totalRevenue.amount > 0
      ? ((netProfit.amount / totalRevenue.amount) * 100)
      : 0;

    const categories: Record<string, number> = {};
    categoryBreakdown.forEach((money, cat) => {
      categories[cat] = money.inReais;
    });

    return NextResponse.json({
      period: { year: query.year, month: query.month },
      totalRevenue: { cents: totalRevenue.amount, reais: totalRevenue.inReais },
      totalExpense: { cents: totalExpense.amount, reais: totalExpense.inReais },
      netProfit: { cents: netProfit.amount, reais: netProfit.inReais },
      profitMargin: Math.round(profitMargin * 100) / 100,
      totalInvestment: { cents: totalInvestment.amount, reais: totalInvestment.inReais },
      expensesByCategory: categories,
    });
  } catch (error) {
    return handleError(error);
  }
}
