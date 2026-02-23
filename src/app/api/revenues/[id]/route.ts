import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, deleteRevenueUseCase } from '@/main/container';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await deleteRevenueUseCase.execute(id, auth.userId);

    return NextResponse.json({ message: 'Receita excluída' });
  } catch (error) {
    return handleError(error);
  }
}
