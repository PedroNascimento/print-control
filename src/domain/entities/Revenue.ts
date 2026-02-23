import { Money } from '../value-objects/Money';
import { RevenueType } from '../enums/RevenueType';

export interface RevenueProps {
  id: string;
  description: string;
  value: Money;
  date: Date;
  type: RevenueType;
  userId: string;
  client?: string;
  cost?: Money;
  expenseReferenceId?: string;
  observation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Revenue {
  public readonly id: string;
  public readonly description: string;
  public readonly value: Money;
  public readonly date: Date;
  public readonly type: RevenueType;
  public readonly userId: string;
  public readonly client?: string;
  public readonly cost?: Money;
  public readonly expenseReferenceId?: string;
  public readonly observation?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: RevenueProps) {
    this.id = props.id;
    this.description = props.description;
    this.value = props.value;
    this.date = props.date;
    this.type = props.type;
    this.userId = props.userId;
    this.client = props.client;
    this.cost = props.cost;
    this.expenseReferenceId = props.expenseReferenceId;
    this.observation = props.observation;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Calcula o lucro bruto da receita.
   * Se houver custo associado, subtrai do valor cobrado.
   */
  get grossProfit(): Money {
    if (!this.cost) return this.value;
    return this.value.subtract(this.cost);
  }

  /**
   * Verifica se a receita é de serviço terceirizado.
   */
  isOutsourced(): boolean {
    return this.type === RevenueType.OUTSOURCED;
  }
}
