import type { SettlementItem, SettlementSourceType } from './useSettlementStore';
import type { SettlementDraftResponse, SettlementResponse } from '../api/settlementApi';

const mapItems = (
  items: SettlementResponse['items'] | SettlementDraftResponse['items'],
  fallback: Array<SettlementItem | undefined> = [],
  fallbackPayerMemberId?: number,
): SettlementItem[] => {
  return items.map((item, index) => {
    const source = fallback[index];
    const payerIds = item.allocations.map((allocation) => allocation.memberId);
    const resolvedPayerMemberId = item.payerMemberId ?? source?.payerMemberId ?? fallbackPayerMemberId;
    const resolvedPayerBankName =
      item.payerBankName != null && item.payerBankName !== '' ? item.payerBankName : source?.payerBankName;
    const resolvedPayerAccountNumber =
      item.payerAccountNumber != null && item.payerAccountNumber !== ''
        ? item.payerAccountNumber
        : source?.payerAccountNumber;
    const resolvedReceiptTitle = item.receiptTitle ?? source?.receiptTitle;
    const resolvedSourceType = (item.sourceType as SettlementSourceType | undefined) ?? source?.sourceType ?? 'manual';
    let resolvedSourceLabel = item.sourceLabel ?? source?.sourceLabel;
    if (!resolvedSourceLabel) {
      if (resolvedSourceType === 'online') {
        resolvedSourceLabel = '온라인 품목';
      } else if (resolvedSourceType === 'manual') {
        resolvedSourceLabel = '수동입력';
      } else if (resolvedSourceType === 'receipt') {
        resolvedSourceLabel = resolvedReceiptTitle ?? '영수증';
      } else {
        resolvedSourceLabel = '정산품목';
      }
    }
    if (resolvedSourceLabel === 'online') resolvedSourceLabel = '온라인 품목';
    if (resolvedSourceLabel === 'manual') resolvedSourceLabel = '수동입력';
    if (resolvedSourceLabel === 'receipt') resolvedSourceLabel = resolvedReceiptTitle ?? '영수증';

    return {
      id: String(item.purchaseItemId),
      name: item.itemName,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      payerIds,
      payerMemberId: resolvedPayerMemberId,
      payerBankName: resolvedPayerBankName,
      payerAccountNumber: resolvedPayerAccountNumber,
      sourceType: resolvedSourceType,
      sourceLabel: resolvedSourceLabel,
      receiptTitle: resolvedReceiptTitle,
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

