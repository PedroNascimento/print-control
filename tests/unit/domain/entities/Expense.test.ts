import { describe, it, expect } from 'vitest';
import { Expense } from '@/domain/entities/Expense';
import { Money } from '@/domain/value-objects/Money';
import { ExpenseType } from '@/domain/enums/ExpenseType';
import { ExpenseCategory } from '@/domain/enums/ExpenseCategory';

describe('Expense Entity', () => {
  const baseProps = {
    id: 'exp-1',
    description: 'Compra de papel A4',
    value: Money.fromCents(3500),
    date: new Date('2025-03-10'),
    category: ExpenseCategory.SUPPLIES,
    type: ExpenseType.OPERATIONAL,
    userId: 'user-1',
  };

  it('should create an expense', () => {
    const expense = new Expense(baseProps);
    expect(expense.id).toBe('exp-1');
    expect(expense.description).toBe('Compra de papel A4');
    expect(expense.value.amount).toBe(3500);
    expect(expense.category).toBe(ExpenseCategory.SUPPLIES);
    expect(expense.type).toBe(ExpenseType.OPERATIONAL);
  });

  describe('isOutsourced', () => {
    it('should return true for OUTSOURCED', () => {
      const expense = new Expense({
        ...baseProps,
        type: ExpenseType.OUTSOURCED,
        category: ExpenseCategory.OUTSOURCING,
      });
      expect(expense.isOutsourced()).toBe(true);
    });

    it('should return false for OPERATIONAL', () => {
      const expense = new Expense(baseProps);
      expect(expense.isOutsourced()).toBe(false);
    });
  });

  it('should accept optional fields', () => {
    const expense = new Expense({
      ...baseProps,
      paymentMethod: 'PIX',
      observation: 'Compra em promoção',
    });
    expect(expense.paymentMethod).toBe('PIX');
    expect(expense.observation).toBe('Compra em promoção');
  });
});
