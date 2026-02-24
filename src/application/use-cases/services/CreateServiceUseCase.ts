import { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import { Service } from '@/domain/entities/Service';
import { Money } from '@/domain/value-objects/Money';
import { randomUUID } from 'crypto';

export interface CreateServiceInput {
  userId: string;
  code: string;
  name: string;
  description?: string;
  defaultPriceCents: number;
  estimatedCostCents?: number;
  category: string;
  isActive?: boolean;
}

export class CreateServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    const existing = await this.serviceRepository.findByCode(input.code, input.userId);
    if (existing) {
      throw new Error('Serviço com este código já existe.');
    }

    const service = new Service({
      id: randomUUID(),
      code: input.code,
      name: input.name,
      description: input.description,
      defaultPrice: Money.fromCents(input.defaultPriceCents),
      estimatedCost: input.estimatedCostCents ? Money.fromCents(input.estimatedCostCents) : undefined,
      category: input.category,
      isActive: input.isActive ?? true,
      userId: input.userId,
    });

    await this.serviceRepository.create(service);
    return service;
  }
}
