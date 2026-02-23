import { describe, it, expect } from 'vitest';
import { Email } from '@/domain/value-objects/Email';
import { InvalidEmailError } from '@/domain/errors/InvalidEmailError';

describe('Email Value Object', () => {
  describe('creation', () => {
    it('should create a valid email', () => {
      const email = Email.create('user@example.com');
      expect(email.value).toBe('user@example.com');
    });

    it('should normalize to lowercase', () => {
      const email = Email.create('USER@EXAMPLE.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  user@example.com  ');
      expect(email.value).toBe('user@example.com');
    });

    it('should throw for invalid email - no @', () => {
      expect(() => Email.create('userexample.com')).toThrow(InvalidEmailError);
    });

    it('should throw for invalid email - no domain', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailError);
    });

    it('should throw for invalid email - empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });

    it('should throw for invalid email - only spaces', () => {
      expect(() => Email.create('   ')).toThrow(InvalidEmailError);
    });
  });

  describe('equality', () => {
    it('should be equal for same email', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('USER@EXAMPLE.COM');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different emails', () => {
      const a = Email.create('user1@example.com');
      const b = Email.create('user2@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the email string', () => {
      const email = Email.create('user@example.com');
      expect(email.toString()).toBe('user@example.com');
    });
  });
});
