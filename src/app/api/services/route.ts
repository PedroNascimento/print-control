import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  createServiceUseCase,
  listServicesUseCase,
  searchServiceUseCase,
} from '@/main/container';
import { createServiceSchema } from '@/presentation/validators/financialSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const input = createServiceSchema.parse(body);

    const result = await createServiceUseCase.execute({
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
    const search = searchParams.get('search');

    if (search) {
      const activeOnly = searchParams.get('activeOnly') !== 'false';
      const result = await searchServiceUseCase.execute(search, auth.userId, activeOnly);
      return NextResponse.json(result);
    }

    const result = await listServicesUseCase.execute(auth.userId);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
