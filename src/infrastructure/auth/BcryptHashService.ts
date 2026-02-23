import { IHashService } from '@/application/interfaces/IHashService';
import bcrypt from 'bcryptjs';

export class BcryptHashService implements IHashService {
  private readonly saltRounds: number;

  constructor(saltRounds?: number) {
    this.saltRounds = saltRounds ?? parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
