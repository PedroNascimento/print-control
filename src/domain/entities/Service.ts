import { Money } from '../value-objects/Money';

export interface ServiceProps {
  id: string;
  code: string;
  name: string;
  defaultPrice: Money;
  category: string;
  userId: string;
  description?: string;
  estimatedCost?: Money;
  isActive?: boolean;
}

export class Service {
  public readonly id: string;
  public readonly code: string;
  public readonly name: string;
  public readonly defaultPrice: Money;
  public readonly category: string;
  public readonly userId: string;
  public readonly description?: string;
  public readonly estimatedCost?: Money;
  public readonly isActive: boolean;

  constructor(props: ServiceProps) {
    this.id = props.id;
    this.code = props.code.toUpperCase();
    this.name = props.name;
    this.defaultPrice = props.defaultPrice;
    this.category = props.category;
    this.userId = props.userId;
    this.description = props.description;
    this.estimatedCost = props.estimatedCost;
    this.isActive = props.isActive ?? true;
  }
}
