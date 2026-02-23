import { Money } from '../value-objects/Money';
import { ExpenseType } from '../enums/ExpenseType';
import { ExpenseCategory } from '../enums/ExpenseCategory';

export interface ExpenseProps {
  id: string;
  description: string;
  value: Money;
  date: Date;
  category: ExpenseCategory;
  type: ExpenseType;
  userId: string;
  paymentMethod?: string;
  observation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Expense {
  public readonly id: string;
  public readonly description: string;
  public readonly value: Money;
  public readonly date: Date;
  public readonly category: ExpenseCategory;
  public readonly type: ExpenseType;
  public readonly userId: string;
  public readonly paymentMethod?: string;
  public readonly observation?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.description = props.description;
    this.value = props.value;
    this.date = props.date;
    this.category = props.category;
    this.type = props.type;
    this.userId = props.userId;
    this.paymentMethod = props.paymentMethod;
    this.observation = props.observation;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Verifica se a despesa é de terceirização.
   */
  isOutsourced(): boolean {
    return this.type === ExpenseType.OUTSOURCED;
  }
}
