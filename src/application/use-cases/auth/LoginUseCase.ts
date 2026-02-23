import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IHashService } from '@/application/interfaces/IHashService';
import { ITokenService } from '@/application/interfaces/ITokenService';
import { Email } from '@/domain/value-objects/Email';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { LoginInputDTO } from '@/application/dtos/auth/LoginInputDTO';
import { LoginOutputDTO } from '@/application/dtos/auth/LoginOutputDTO';

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    const email = Email.create(input.email);
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.tokenService.generate({
      userId: user.id,
      email: user.email.value,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email.value,
      },
    };
  }
}
