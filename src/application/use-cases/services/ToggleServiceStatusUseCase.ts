import { IServiceRepository } from '@/domain/repositories/IServiceRepository';

export class ToggleServiceStatusUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(id: string, userId: string, isActive: boolean): Promise<void> {
    await this.serviceRepository.toggleStatus(id, userId, isActive);
  }
}
