import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  createExpenseUseCase,
  listExpenseByPeriodUseCase,
} from '@/main/container';
import { createExpenseSchema, periodQuerySchema } from '@/presentation/validators/financialSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const input = createExpenseSchema.parse(body);

    const result = await createExpenseUseCase.execute({
      ...input,
      userId: auth.userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const query = periodQuerySchema.parse({
      year: searchParams.get('year'),
      month: searchParams.get('month'),
    });

    const result = await listExpenseByPeriodUseCase.execute(
      auth.userId,
      query.year,
      query.month,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
