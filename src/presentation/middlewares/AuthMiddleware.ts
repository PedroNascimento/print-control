import { NextRequest, NextResponse } from 'next/server';
import { ValidateTokenUseCase } from '@/application/use-cases/auth/ValidateTokenUseCase';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
}

export function createAuthMiddleware(validateTokenUseCase: ValidateTokenUseCase) {
  return function authMiddleware(
    request: NextRequest,
  ): { userId: string } | NextResponse {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 },
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = validateTokenUseCase.execute(token);
      return { userId: payload.userId };
    } catch {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 },
      );
    }
  };
}
