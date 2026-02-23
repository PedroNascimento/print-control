import { DomainError } from './DomainError';

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id?: string) {
    const msg = id
      ? `${entityName} with id "${id}" not found`
      : `${entityName} not found`;
    super(msg);
    this.name = 'EntityNotFoundError';
  }
}
