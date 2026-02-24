import { IRevenueRepository } from '@/domain/repositories/IRevenueRepository';
import { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import { Revenue } from '@/domain/entities/Revenue';
import { RevenueItem } from '@/domain/entities/RevenueItem';
import { Money } from '@/domain/value-objects/Money';
import { RevenueType } from '@/domain/enums/RevenueType';
import { randomUUID } from 'crypto';

export interface CreateSaleInput {
  userId: string;
  client?: string;
  observation?: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    // We let the frontend pass the price, but we validate it or we just trust the service price.
    // In POS, it's common to have quantity and standard price, but maybe discounts.
    // To ensure accuracy, we will pull the price from the DB (Service catalog).
  }>;
}

export class CreateSaleUseCase {
  constructor(
    private revenueRepository: IRevenueRepository,
    private serviceRepository: IServiceRepository
  ) {}

  async execute(input: CreateSaleInput): Promise<Revenue> {
    if (!input.items || input.items.length === 0) {
      throw new Error('A venda precisa ter pelo menos um item.');
    }

    const revenueId = randomUUID();
    let totalValueCents = 0;
    let totalCostCents = 0;
    const revenueItems: RevenueItem[] = [];

    // Validar e calcular itens
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error('A quantidade do item deve ser maior que zero.');
      }

      const service = await this.serviceRepository.findById(item.serviceId, input.userId);
      if (!service) {
        throw new Error(`Serviço não encontrado (ID: ${item.serviceId}).`);
      }

      const unitPrice = service.defaultPrice;
      const unitCost = service.estimatedCost;
      const totalPrice = unitPrice.multiply(item.quantity);
      
      const revItem = new RevenueItem({
        id: randomUUID(),
        revenueId,
        serviceId: service.id,
        quantity: item.quantity,
        unitPrice,
        unitCost,
        totalPrice,
      });

      revenueItems.push(revItem);

      totalValueCents += totalPrice.amount;
      if (revItem.totalCost) {
        totalCostCents += revItem.totalCost.amount;
      }
    }

    // Criar a Receita pai (Venda) consolidada
    const saleRevenue = new Revenue({
      id: revenueId,
      description: `Venda PDV - ${revenueItems.length} item(ns)`,
      value: Money.fromCents(totalValueCents),
      date: new Date(),
      type: RevenueType.OWN, // PDV sales default to OWN, unless we want to map category
      userId: input.userId,
      client: input.client,
      cost: totalCostCents > 0 ? Money.fromCents(totalCostCents) : undefined,
      observation: input.observation,
      items: revenueItems,
    });

    await this.revenueRepository.create(saleRevenue);

    return saleRevenue;
  }
}
