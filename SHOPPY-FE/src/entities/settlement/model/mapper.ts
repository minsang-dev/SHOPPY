import type { SettlementItem } from './useSettlementStore';
import type { SettlementDraftResponse, SettlementResponse } from '../api/settlementApi';

const mapItems = (
  items: SettlementResponse['items'] | SettlementDraftResponse['items'],
  fallback: Array<SettlementItem | undefined> = [],
  fallbackPayerMemberId?: number,
): SettlementItem[] => {
  return items.map((item, index) => {
    const source = fallback[index];
    const payerIds = item.allocations.map((allocation) => allocation.memberId);
    const resolvedPayerMemberId = item.payerMemberId ?? fallbackPayerMemberId ?? source?.payerMemberId;
    const resolvedPayerBankName =
      item.payerBankName != null && item.payerBankName !== '' ? item.payerBankName : source?.payerBankName;
    const resolvedPayerAccountNumber =
      item.payerAccountNumber != null && item.payerAccountNumber !== ''
        ? item.payerAccountNumber
        : source?.payerAccountNumber;

    return {
      id: String(item.purchaseItemId),
      name: item.itemName,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      payerIds,
      payerMemberId: resolvedPayerMemberId,
      payerBankName: resolvedPayerBankName,
      payerAccountNumber: resolvedPayerAccountNumber,
      sourceType: source?.sourceType ?? 'manual',
      sourceLabel: source?.sourceLabel ?? '정산품목',
      receiptTitle: source?.receiptTitle,
    };
  });
};

export const mapSettlementResponseToStoreItems = (
  response: SettlementResponse,
  fallback: Array<SettlementItem | undefined> = [],
): SettlementItem[] => mapItems(response.items, fallback, response.payerMemberId);

export const mapSettlementDraftResponseToStoreItems = (
  response: SettlementDraftResponse,
  fallback: Array<SettlementItem | undefined> = [],
): SettlementItem[] => mapItems(response.items, fallback);
