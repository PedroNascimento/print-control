import { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import { Service } from '@/domain/entities/Service';

export class ListServicesUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(userId: string): Promise<Service[]> {
    return this.serviceRepository.getAll(userId);
  }
}
