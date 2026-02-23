import { DomainError } from './DomainError';

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email address: "${email}"`);
    this.name = 'InvalidEmailError';
  }
}
