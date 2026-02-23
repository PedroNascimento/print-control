import { InvalidEmailError } from '../errors/InvalidEmailError';

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    const trimmed = value.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailError(value);
    }
    return new Email(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
