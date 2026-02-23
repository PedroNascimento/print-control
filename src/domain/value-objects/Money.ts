import { InvalidMoneyError } from '../errors/InvalidMoneyError';

export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string = 'BRL',
  ) {
    if (!Number.isInteger(_amount)) {
      throw new InvalidMoneyError('Amount must be an integer (centavos)');
    }
  }

  static fromCents(cents: number, currency = 'BRL'): Money {
    return new Money(cents, currency);
  }

  static fromReais(reais: number, currency = 'BRL'): Money {
    return new Money(Math.round(reais * 100), currency);
  }

  static zero(currency = 'BRL'): Money {
    return new Money(0, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get inReais(): number {
    return this._amount / 100;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this._amount * factor), this._currency);
  }

  isNegative(): boolean {
    return this._amount < 0;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isPositive(): boolean {
    return this._amount > 0;
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount > other._amount;
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount < other._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._currency} ${this.inReais.toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new InvalidMoneyError(
        `Cannot operate on different currencies: ${this._currency} vs ${other._currency}`,
      );
    }
  }
}
