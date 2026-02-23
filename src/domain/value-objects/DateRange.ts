import { DomainError } from '../errors/DomainError';

export class DateRange {
  private constructor(
    private readonly _start: Date,
    private readonly _end: Date,
  ) {
    if (_start > _end) {
      throw new DomainError('Start date must be before or equal to end date');
    }
  }

  static create(start: Date, end: Date): DateRange {
    return new DateRange(start, end);
  }

  static forDay(date: Date): DateRange {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return new DateRange(start, end);
  }

  static forMonth(year: number, month: number): DateRange {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return new DateRange(start, end);
  }

  static forYear(year: number): DateRange {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return new DateRange(start, end);
  }

  get start(): Date {
    return this._start;
  }

  get end(): Date {
    return this._end;
  }

  contains(date: Date): boolean {
    return date >= this._start && date <= this._end;
  }

  overlaps(other: DateRange): boolean {
    return this._start <= other._end && this._end >= other._start;
  }

  getDays(): number {
    const diffMs = this._end.getTime() - this._start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
