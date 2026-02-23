import { describe, it, expect } from 'vitest';
import { User } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';

describe('User Entity', () => {
  it('should create a user via factory method', () => {
    const user = User.create({
      id: 'user-1',
      name: 'Pedro',
      email: Email.create('pedro@example.com'),
      passwordHash: 'hashed_password_123',
    });

    expect(user.id).toBe('user-1');
    expect(user.name).toBe('Pedro');
    expect(user.email.value).toBe('pedro@example.com');
    expect(user.passwordHash).toBe('hashed_password_123');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a user via constructor', () => {
    const now = new Date();
    const user = new User({
      id: 'user-2',
      name: 'Maria',
      email: Email.create('maria@example.com'),
      passwordHash: 'hash_456',
      createdAt: now,
      updatedAt: now,
    });

    expect(user.id).toBe('user-2');
    expect(user.name).toBe('Maria');
    expect(user.createdAt).toEqual(now);
  });
});
