import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, deleteExpenseUseCase } from '@/main/container';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await deleteExpenseUseCase.execute(id, auth.userId);

    return NextResponse.json({ message: 'Despesa excluída' });
  } catch (error) {
    return handleError(error);
  }
}
