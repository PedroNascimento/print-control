import { Expense } from '@/domain/entities/Expense';

export interface ExpenseOutputDTO {
  id: string;
  description: string;
  valueCents: number;
  valueReais: number;
  date: string;
  category: string;
  type: string;
  paymentMethod?: string;
  observation?: string;
  createdAt: string;
}

export function toExpenseOutput(expense: Expense): ExpenseOutputDTO {
  return {
    id: expense.id,
    description: expense.description,
    valueCents: expense.value.amount,
    valueReais: expense.value.inReais,
    date: expense.date.toISOString(),
    category: expense.category,
    type: expense.type,
    paymentMethod: expense.paymentMethod,
    observation: expense.observation,
    createdAt: expense.createdAt.toISOString(),
  };
}
