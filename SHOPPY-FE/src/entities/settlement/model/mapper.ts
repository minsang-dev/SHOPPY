import type { SettlementItem } from './useSettlementStore';
import type { SettlementDraftResponse, SettlementResponse } from '../api/settlementApi';

const mapItems = (
  items: SettlementResponse['items'] | SettlementDraftResponse['items'],
  fallback: SettlementItem[] = [],
): SettlementItem[] => {
  return items.map((item, index) => {
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

export const mapSettlementResponseToStoreItems = (
  response: SettlementResponse,
  fallback: SettlementItem[] = [],
): SettlementItem[] => mapItems(response.items, fallback);

export const mapSettlementDraftResponseToStoreItems = (
  response: SettlementDraftResponse,
  fallback: SettlementItem[] = [],
): SettlementItem[] => mapItems(response.items, fallback);
