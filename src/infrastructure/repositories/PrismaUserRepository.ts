import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { prisma } from '../database/PrismaClient';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { email: email.value },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.value,
        passwordHash: user.passwordHash,
      },
    });
  }

  private toDomain(data: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: data.id,
      name: data.name,
      email: Email.create(data.email),
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
