import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IHashService } from '@/application/interfaces/IHashService';
import { ITokenService } from '@/application/interfaces/ITokenService';
import { User } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { ValidationError } from '@/application/errors/ValidationError';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutputDTO {
  token: string;
  user: { id: string; name: string; email: string };
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterDTO): Promise<RegisterOutputDTO> {
    const email = Email.create(input.email);

    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError('Este e-mail já está cadastrado');
    }

    const passwordHash = await this.hashService.hash(input.password);

    const user = User.create({
      id: uuidv4(),
      name: input.name,
      email: email,
      passwordHash,
    });

    await this.userRepo.create(user);

    const token = this.tokenService.generate({
      userId: user.id,
      email: user.email.value,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email.value },
    };
  }
}
