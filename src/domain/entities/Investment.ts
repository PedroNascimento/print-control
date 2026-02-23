import { Money } from '../value-objects/Money';
import { InvestmentType } from '../enums/InvestmentType';

export interface InvestmentProps {
  id: string;
  description: string;
  value: Money;
  date: Date;
  type: InvestmentType;
  userId: string;
  observation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Investment {
  public readonly id: string;
  public readonly description: string;
  public readonly value: Money;
  public readonly date: Date;
  public readonly type: InvestmentType;
  public readonly userId: string;
  public readonly observation?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: InvestmentProps) {
    this.id = props.id;
    this.description = props.description;
    this.value = props.value;
    this.date = props.date;
    this.type = props.type;
    this.userId = props.userId;
    this.observation = props.observation;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
