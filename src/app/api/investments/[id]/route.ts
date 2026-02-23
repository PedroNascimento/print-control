import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, deleteInvestmentUseCase } from '@/main/container';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await deleteInvestmentUseCase.execute(id, auth.userId);

    return NextResponse.json({ message: 'Investimento excluído' });
  } catch (error) {
    return handleError(error);
  }
}
