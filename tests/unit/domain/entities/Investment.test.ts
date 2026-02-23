import { describe, it, expect } from 'vitest';
import { Investment } from '@/domain/entities/Investment';
import { Money } from '@/domain/value-objects/Money';
import { InvestmentType } from '@/domain/enums/InvestmentType';

describe('Investment Entity', () => {
  const baseProps = {
    id: 'inv-1',
    description: 'Impressora Epson L3250',
    value: Money.fromCents(150000),
    date: new Date('2025-01-10'),
    type: InvestmentType.EQUIPMENT,
    userId: 'user-1',
  };

  it('should create an investment', () => {
    const investment = new Investment(baseProps);
    expect(investment.id).toBe('inv-1');
    expect(investment.description).toBe('Impressora Epson L3250');
    expect(investment.value.amount).toBe(150000);
    expect(investment.value.inReais).toBe(1500.00);
    expect(investment.type).toBe(InvestmentType.EQUIPMENT);
  });

  it('should accept optional observation', () => {
    const investment = new Investment({
      ...baseProps,
      observation: 'Compra parcelada em 10x',
    });
    expect(investment.observation).toBe('Compra parcelada em 10x');
  });

  it('should set createdAt and updatedAt automatically', () => {
    const investment = new Investment(baseProps);
    expect(investment.createdAt).toBeInstanceOf(Date);
    expect(investment.updatedAt).toBeInstanceOf(Date);
  });
});
