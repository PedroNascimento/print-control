import { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import { Service } from '@/domain/entities/Service';

export class SearchServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(query: string, userId: string, activeOnly: boolean = true): Promise<Service[]> {
    if (!query || query.trim().length === 0) {
      return this.serviceRepository.getAll(userId);
    }
    return this.serviceRepository.search(query.trim(), userId, activeOnly);
  }
}
