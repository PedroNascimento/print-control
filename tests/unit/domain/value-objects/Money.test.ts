import { describe, it, expect } from 'vitest';
import { Money } from '@/domain/value-objects/Money';
import { InvalidMoneyError } from '@/domain/errors/InvalidMoneyError';

describe('Money Value Object', () => {
  describe('creation', () => {
    it('should create from cents', () => {
      const money = Money.fromCents(1050);
      expect(money.amount).toBe(1050);
      expect(money.inReais).toBe(10.50);
      expect(money.currency).toBe('BRL');
    });

    it('should create from reais', () => {
      const money = Money.fromReais(10.50);
      expect(money.amount).toBe(1050);
      expect(money.inReais).toBe(10.50);
    });

    it('should create zero', () => {
      const money = Money.zero();
      expect(money.amount).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it('should throw on non-integer amount', () => {
      expect(() => Money.fromCents(10.5)).toThrow(InvalidMoneyError);
    });

    it('should round correctly from reais', () => {
      const money = Money.fromReais(19.99);
      expect(money.amount).toBe(1999);
    });
  });

  describe('arithmetic', () => {
    it('should add two Money values', () => {
      const a = Money.fromCents(1000);
      const b = Money.fromCents(2050);
      const result = a.add(b);
      expect(result.amount).toBe(3050);
    });

    it('should subtract two Money values', () => {
      const a = Money.fromCents(5000);
      const b = Money.fromCents(3000);
      const result = a.subtract(b);
      expect(result.amount).toBe(2000);
    });

    it('should allow negative result from subtraction', () => {
      const a = Money.fromCents(1000);
      const b = Money.fromCents(3000);
      const result = a.subtract(b);
      expect(result.amount).toBe(-2000);
      expect(result.isNegative()).toBe(true);
    });

    it('should multiply by a factor', () => {
      const money = Money.fromCents(1000);
      const result = money.multiply(1.5);
      expect(result.amount).toBe(1500);
    });

    it('should round on multiply', () => {
      const money = Money.fromCents(333);
      const result = money.multiply(3);
      expect(result.amount).toBe(999);
    });
  });

  describe('comparisons', () => {
    it('should detect positive', () => {
      expect(Money.fromCents(100).isPositive()).toBe(true);
      expect(Money.fromCents(0).isPositive()).toBe(false);
      expect(Money.fromCents(-100).isPositive()).toBe(false);
    });

    it('should detect negative', () => {
      expect(Money.fromCents(-100).isNegative()).toBe(true);
      expect(Money.fromCents(0).isNegative()).toBe(false);
    });

    it('should compare greater/less than', () => {
      const a = Money.fromCents(500);
      const b = Money.fromCents(300);
      expect(a.greaterThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(true);
    });

    it('should check equality', () => {
      const a = Money.fromCents(500);
      const b = Money.fromCents(500);
      expect(a.equals(b)).toBe(true);
    });

    it('should NOT be equal with different currencies', () => {
      const a = Money.fromCents(500, 'BRL');
      const b = Money.fromCents(500, 'USD');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('currency safety', () => {
    it('should throw when adding different currencies', () => {
      const brl = Money.fromCents(100, 'BRL');
      const usd = Money.fromCents(100, 'USD');
      expect(() => brl.add(usd)).toThrow(InvalidMoneyError);
    });

    it('should throw when subtracting different currencies', () => {
      const brl = Money.fromCents(100, 'BRL');
      const usd = Money.fromCents(100, 'USD');
      expect(() => brl.subtract(usd)).toThrow(InvalidMoneyError);
    });
  });

  describe('toString', () => {
    it('should format correctly', () => {
      expect(Money.fromCents(1050).toString()).toBe('BRL 10.50');
      expect(Money.fromCents(0).toString()).toBe('BRL 0.00');
      expect(Money.fromCents(99).toString()).toBe('BRL 0.99');
    });
  });
});
