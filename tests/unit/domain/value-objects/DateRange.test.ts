import { describe, it, expect } from 'vitest';
import { DateRange } from '@/domain/value-objects/DateRange';
import { DomainError } from '@/domain/errors/DomainError';

describe('DateRange Value Object', () => {
  describe('creation', () => {
    it('should create a valid date range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      const range = DateRange.create(start, end);
      expect(range.start).toEqual(start);
      expect(range.end).toEqual(end);
    });

    it('should allow same start and end date', () => {
      const date = new Date('2025-01-15');
      const range = DateRange.create(date, date);
      expect(range.start).toEqual(date);
      expect(range.end).toEqual(date);
    });

    it('should throw when start is after end', () => {
      const start = new Date('2025-02-01');
      const end = new Date('2025-01-01');
      expect(() => DateRange.create(start, end)).toThrow(DomainError);
    });
  });

  describe('factory methods', () => {
    it('should create range for a day', () => {
      const range = DateRange.forDay(new Date('2025-03-15'));
      expect(range.start.getHours()).toBe(0);
      expect(range.start.getMinutes()).toBe(0);
      expect(range.end.getHours()).toBe(23);
      expect(range.end.getMinutes()).toBe(59);
    });

    it('should create range for a month', () => {
      const range = DateRange.forMonth(2025, 2); // February 2025
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(1); // 0-indexed
      expect(range.end.getDate()).toBe(28); // Feb 2025 has 28 days
    });

    it('should create range for a year', () => {
      const range = DateRange.forYear(2025);
      expect(range.start.getMonth()).toBe(0);
      expect(range.start.getDate()).toBe(1);
      expect(range.end.getMonth()).toBe(11);
      expect(range.end.getDate()).toBe(31);
    });
  });

  describe('contains', () => {
    it('should return true for date inside range', () => {
      const range = DateRange.create(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      );
      expect(range.contains(new Date('2025-01-15'))).toBe(true);
    });

    it('should return true for date at boundaries', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      const range = DateRange.create(start, end);
      expect(range.contains(start)).toBe(true);
      expect(range.contains(end)).toBe(true);
    });

    it('should return false for date outside range', () => {
      const range = DateRange.create(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      );
      expect(range.contains(new Date('2025-02-01'))).toBe(false);
    });
  });

  describe('overlaps', () => {
    it('should detect overlapping ranges', () => {
      const a = DateRange.create(new Date('2025-01-01'), new Date('2025-01-20'));
      const b = DateRange.create(new Date('2025-01-15'), new Date('2025-02-10'));
      expect(a.overlaps(b)).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      const a = DateRange.create(new Date('2025-01-01'), new Date('2025-01-10'));
      const b = DateRange.create(new Date('2025-01-20'), new Date('2025-01-31'));
      expect(a.overlaps(b)).toBe(false);
    });
  });

  describe('getDays', () => {
    it('should calculate days in range', () => {
      const range = DateRange.create(
        new Date('2025-01-01T00:00:00'),
        new Date('2025-01-10T00:00:00'),
      );
      expect(range.getDays()).toBe(9);
    });
  });
});
