import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  create(user: User): Promise<void>;
}
