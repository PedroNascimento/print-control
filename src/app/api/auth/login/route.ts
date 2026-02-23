import { NextRequest, NextResponse } from 'next/server';
import { loginUseCase } from '@/main/container';
import { loginSchema } from '@/presentation/validators/authSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await loginUseCase.execute(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
