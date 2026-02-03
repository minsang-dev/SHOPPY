import { apiGet, apiPost } from '@/shared/api/utils';

export interface ReceiptOcrRequest {
  title: string;
  payerMemberId: number;
  bankName: string;
  accountNumber: string;
  imageBase64: string;
}

export interface ReceiptOcrItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptOcrResponse {
  items: ReceiptOcrItem[];
}

export interface SettlementFinalizeRequest {
  items: unknown[];
}

export interface SettlementTransferRow {
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  done: boolean;
}

export interface SettlementResultResponse {
  transfers: SettlementTransferRow[];
}

export const recognizeReceiptItems = async (
  roomId: string,
  payload: ReceiptOcrRequest,
): Promise<ReceiptOcrResponse> => {
  return apiPost<ReceiptOcrResponse>(`/rooms/${roomId}/settlement/ocr`, payload);
};

export const finalizeSettlement = async (
  roomId: string,
  payload: SettlementFinalizeRequest,
): Promise<void> => {
  await apiPost<void>(`/rooms/${roomId}/settlement/finalize`, payload);
};

export const getSettlementResult = async (roomId: string): Promise<SettlementResultResponse> => {
  return apiGet<SettlementResultResponse>(`/rooms/${roomId}/settlement/result`);
};
