import type { SettlementItem, SettlementSourceType } from './useSettlementStore';
import type { SettlementDraftResponse, SettlementResponse } from '../api/settlementApi';

const toPositiveMemberId = (value: unknown): number | undefined => {
  const memberId = Number(value ?? 0);
  if (!Number.isFinite(memberId) || memberId <= 0) return undefined;
  return memberId;
};

const inferPayerMemberId = (
  item: SettlementResponse['items'][number] | SettlementDraftResponse['items'][number],
  source?: SettlementItem,
  fallbackPayerMemberId?: number,
): number | undefined => {
  const explicit = toPositiveMemberId(item.payerMemberId);
  if (explicit) return explicit;

  const sourcePayer = toPositiveMemberId(source?.payerMemberId);
  if (sourcePayer) return sourcePayer;

  // Some responses omit item-level payerMemberId. Infer payer as the member
  // with the highest positive diffAmount for this item.
  const byDiff = item.allocations.reduce<{ memberId?: number; diff: number }>(
    (best, allocation) => {
      const memberId = toPositiveMemberId(allocation.memberId);
      const diff = Number(allocation.diffAmount ?? 0);
      if (!memberId || !Number.isFinite(diff)) return best;
      if (diff > best.diff) {
        return { memberId, diff };
      }
      return best;
    },
    { memberId: undefined, diff: 0 },
  );

  if (byDiff.memberId && byDiff.diff > 0) {
    return byDiff.memberId;
  }

  const fallback = toPositiveMemberId(fallbackPayerMemberId);
  return fallback;
};

const mapItems = (
  items: SettlementResponse['items'] | SettlementDraftResponse['items'],
  fallback: Array<SettlementItem | undefined> = [],
  fallbackPayerMemberId?: number,
): SettlementItem[] => {
  return items.map((item, index) => {
    const source = fallback[index];
    const payerIds = item.allocations.map((allocation) => allocation.memberId);
    const resolvedPayerMemberId = inferPayerMemberId(item, source, fallbackPayerMemberId);
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
