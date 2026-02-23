import { NextRequest, NextResponse } from 'next/server';
import { registerUseCase } from '@/main/container';
import { registerSchema } from '@/presentation/validators/authSchemas';
import { handleError } from '@/presentation/middlewares/ErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const result = await registerUseCase.execute(input);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
