import { Service } from '../entities/Service';

export interface IServiceRepository {
  create(service: Service): Promise<void>;
  update(service: Service): Promise<void>;
  findById(id: string, userId: string): Promise<Service | null>;
  findByCode(code: string, userId: string): Promise<Service | null>;
  search(query: string, userId: string, activeOnly?: boolean): Promise<Service[]>;
  getAll(userId: string): Promise<Service[]>;
  toggleStatus(id: string, userId: string, isActive: boolean): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
}
