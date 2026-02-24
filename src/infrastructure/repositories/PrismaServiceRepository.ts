import { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import { Service } from '@/domain/entities/Service';
import { Money } from '@/domain/value-objects/Money';
import { prisma } from '../database/PrismaClient';

type PrismaService = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  defaultPrice: number;
  estimatedCost: number | null;
  isActive: boolean;
  category: string;
  userId: string;
};

export class PrismaServiceRepository implements IServiceRepository {
  private mapToDomain(model: PrismaService): Service {
    return new Service({
      id: model.id,
      code: model.code,
      name: model.name,
      description: model.description || undefined,
      defaultPrice: Money.fromCents(model.defaultPrice),
      estimatedCost: model.estimatedCost ? Money.fromCents(model.estimatedCost) : undefined,
      isActive: model.isActive,
      category: model.category,
      userId: model.userId,
    });
  }

  async create(service: Service): Promise<void> {
    await prisma.service.create({
      data: {
        id: service.id,
        code: service.code,
        name: service.name,
        description: service.description,
        defaultPrice: service.defaultPrice.amount,
        estimatedCost: service.estimatedCost?.amount,
        isActive: service.isActive,
        category: service.category,
        userId: service.userId,
      },
    });
  }

  async update(service: Service): Promise<void> {
    await prisma.service.update({
      where: {
        id: service.id,
        userId: service.userId,
      },
      data: {
        code: service.code,
        name: service.name,
        description: service.description,
        defaultPrice: service.defaultPrice.amount,
        estimatedCost: service.estimatedCost?.amount,
        isActive: service.isActive,
        category: service.category,
      },
    });
  }

  async findById(id: string, userId: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id, userId },
    });
    return service ? this.mapToDomain(service) : null;
  }

  async findByCode(code: string, userId: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: {
        userId_code: {
          userId,
          code,
        },
      },
    });
    return service ? this.mapToDomain(service) : null;
  }

  async search(query: string, userId: string, activeOnly: boolean = false): Promise<Service[]> {
    const whereClause: any = {
      userId,
      OR: [
        { code: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (activeOnly) {
      whereClause.isActive = true;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      take: 20, // Limit for autocomplete performance
    });

    return services.map(s => this.mapToDomain(s));
  }

  async getAll(userId: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return services.map(s => this.mapToDomain(s));
  }

  async toggleStatus(id: string, userId: string, isActive: boolean): Promise<void> {
    await prisma.service.update({
      where: { id, userId },
      data: { isActive },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.service.delete({
      where: { id, userId },
    });
  }
}
