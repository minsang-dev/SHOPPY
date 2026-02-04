import { apiRequest } from '@/shared/api/http';

export interface ReceiptUploadItem {
  item_name: string;
  unit_price: number;
  quantity: number;
}

export interface ReceiptUploadResponse {
  receipt_id: number;
  settlement_id: number;
  image_url: string;
  items: ReceiptUploadItem[];
}

export interface SettlementCreateItemRequest {
  itemName: string;
  unitPrice: number;
  quantity: number;
  payerMemberId: number;
  payerBankName: string;
  payerAccountNumber: string;
}

export interface SettlementCreateRequest {
  payerMemberId: number;
  totalAmount: number;
  items: SettlementCreateItemRequest[];
}

export interface SettlementAllocationResponse {
  allocationId: number;
  memberId: number;
  amountToPay: number;
  diffAmount: number;
  settlementStatus: number;
}

export interface SettlementItemResponse {
  purchaseItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  payerMemberId?: number;
  payerBankName?: string;
  payerAccountNumber?: string;
  allocations: SettlementAllocationResponse[];
}

export interface SettlementResponse {
  purchaseId: number;
  roomId: number;
  payerMemberId: number;
  totalAmount: number;
  status: string;
  items: SettlementItemResponse[];
}

export const uploadReceiptImage = async (
  roomId: string,
  file: File,
): Promise<ReceiptUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<ReceiptUploadResponse>({
    method: 'POST',
    url: `/rooms/${roomId}/settlements/receipt`,
    data: formData,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  });
};

export const createSettlement = async (
  roomId: string,
  payload: SettlementCreateRequest,
): Promise<SettlementResponse> => {
  return apiRequest<SettlementResponse>({
    method: 'POST',
    url: `/rooms/${roomId}/settlements`,
    data: payload,
  });
};

export const getSettlement = async (settlementId: number): Promise<SettlementResponse> => {
  return apiRequest<SettlementResponse>({
    method: 'GET',
    url: `/settlements/${settlementId}`,
  });
};

export const updateSettlementItemSplits = async (
  itemId: number,
  memberIds: number[],
): Promise<void> => {
  await apiRequest<void>({
    method: 'PUT',
    url: `/settlement-items/${itemId}/splits`,
    data: { memberIds },
  });
};

export const completeSettlement = async (settlementId: number): Promise<string> => {
  return apiRequest<string>({
    method: 'POST',
    url: `/settlements/${settlementId}/complete`,
  });
};
