import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, createSaleUseCase } from '@/main/container';
import { createSaleSchema } from '@/presentation/validators/financialSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const input = createSaleSchema.parse(body);

    const result = await createSaleUseCase.execute({
      ...input,
      userId: auth.userId,
    });

    return NextResponse.json(
      { success: true, revenueId: result.id, totalValue: result.value.amount },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
