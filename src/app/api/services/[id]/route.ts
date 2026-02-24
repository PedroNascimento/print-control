import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  toggleServiceStatusUseCase,
} from '@/main/container';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Note: params must be awaited in Next.js 15+
) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const resolvedParams = await params;
    const body = await request.json();
    
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    await toggleServiceStatusUseCase.execute(resolvedParams.id, auth.userId, body.isActive);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
