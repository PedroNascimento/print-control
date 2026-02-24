import { Money } from '../value-objects/Money';

export interface RevenueItemProps {
  id: string;
  revenueId: string;
  serviceId?: string;
  quantity: number;
  unitPrice: Money;
  unitCost?: Money;
  totalPrice: Money;
}

export class RevenueItem {
  public readonly id: string;
  public readonly revenueId: string;
  public readonly serviceId?: string;
  public readonly quantity: number;
  public readonly unitPrice: Money;
  public readonly unitCost?: Money;
  public readonly totalPrice: Money;

  constructor(props: RevenueItemProps) {
    this.id = props.id;
    this.revenueId = props.revenueId;
    this.serviceId = props.serviceId;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.unitCost = props.unitCost;
    this.totalPrice = props.totalPrice;
  }

  get totalCost(): Money {
    return this.unitCost ? this.unitCost.multiply(this.quantity) : Money.fromCents(0);
  }
}
