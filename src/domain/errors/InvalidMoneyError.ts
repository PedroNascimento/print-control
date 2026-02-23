import { DomainError } from './DomainError';

export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(`Invalid money operation: ${message}`);
    this.name = 'InvalidMoneyError';
  }
}
