import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { DomainError } from '@/domain/errors/DomainError';
import { EntityNotFoundError } from '@/domain/errors/EntityNotFoundError';

export function handleError(error: any): NextResponse {
    const issues = error?.issues || error?.errors || [];
    return NextResponse.json(
      {
        error: 'Dados inválidos',
        details: issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 },
    );

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 },
    );
  }

  if (error instanceof EntityNotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 },
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 422 },
    );
  }

  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 },
  );
}
