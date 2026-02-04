import type { SettlementItem } from './useSettlementStore';
import type { SettlementResponse } from '../api/settlementApi';

export const mapSettlementResponseToStoreItems = (
  response: SettlementResponse,
  fallback: SettlementItem[] = [],
): SettlementItem[] => {
  return response.items.map((item, index) => {
    const source = fallback[index];
    const payerIds = item.allocations.map((allocation) => allocation.memberId);

    return {
      id: String(item.purchaseItemId),
      name: item.itemName,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      payerIds,
      payerMemberId: item.payerMemberId,
      payerBankName: item.payerBankName,
      payerAccountNumber: item.payerAccountNumber,
      sourceType: source?.sourceType ?? 'manual',
      sourceLabel: source?.sourceLabel ?? '정산품목',
      receiptTitle: source?.receiptTitle,
    };
  });
};
