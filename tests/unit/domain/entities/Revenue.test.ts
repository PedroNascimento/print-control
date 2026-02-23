import { describe, it, expect } from 'vitest';
import { Revenue } from '@/domain/entities/Revenue';
import { Money } from '@/domain/value-objects/Money';
import { RevenueType } from '@/domain/enums/RevenueType';

describe('Revenue Entity', () => {
  const baseProps = {
    id: 'rev-1',
    description: 'Impressão de cartões',
    value: Money.fromCents(5000),
    date: new Date('2025-03-15'),
    type: RevenueType.OWN,
    userId: 'user-1',
  };

  it('should create a revenue', () => {
    const revenue = new Revenue(baseProps);
    expect(revenue.id).toBe('rev-1');
    expect(revenue.description).toBe('Impressão de cartões');
    expect(revenue.value.amount).toBe(5000);
    expect(revenue.type).toBe(RevenueType.OWN);
  });

  describe('grossProfit', () => {
    it('should return full value when no cost', () => {
      const revenue = new Revenue(baseProps);
      expect(revenue.grossProfit.amount).toBe(5000);
    });

    it('should subtract cost from value', () => {
      const revenue = new Revenue({
        ...baseProps,
        cost: Money.fromCents(2000),
      });
      expect(revenue.grossProfit.amount).toBe(3000);
    });

    it('should allow negative gross profit', () => {
      const revenue = new Revenue({
        ...baseProps,
        value: Money.fromCents(1000),
        cost: Money.fromCents(3000),
      });
      expect(revenue.grossProfit.amount).toBe(-2000);
      expect(revenue.grossProfit.isNegative()).toBe(true);
    });
  });

  describe('isOutsourced', () => {
    it('should return true for OUTSOURCED', () => {
      const revenue = new Revenue({
        ...baseProps,
        type: RevenueType.OUTSOURCED,
      });
      expect(revenue.isOutsourced()).toBe(true);
    });

    it('should return false for OWN', () => {
      const revenue = new Revenue(baseProps);
      expect(revenue.isOutsourced()).toBe(false);
    });
  });

  it('should accept optional fields', () => {
    const revenue = new Revenue({
      ...baseProps,
      client: 'João Silva',
      observation: 'Entrega rápida',
      expenseReferenceId: 'exp-1',
    });
    expect(revenue.client).toBe('João Silva');
    expect(revenue.observation).toBe('Entrega rápida');
    expect(revenue.expenseReferenceId).toBe('exp-1');
  });
});
