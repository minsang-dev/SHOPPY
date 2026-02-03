import { create } from 'zustand';

export type ParticipantSelectionStatus = 'checked' | 'unchecked';
export type SettlementSourceType = 'manual' | 'receipt' | 'online';

export interface SettlementItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  payerIds?: number[];
  payerMemberId?: number;
  payerBankName?: string;
  payerAccountNumber?: string;
  receiptTitle?: string;
  sourceType: SettlementSourceType;
  sourceLabel: string;
}

interface SettlementStore {
  participantSelections: Record<number, Record<number, ParticipantSelectionStatus>>;
  settlementItemsByRoom: Record<string, SettlementItem[]>;
  transferStatusByRoom: Record<string, Record<string, boolean>>;

  toggleParticipantSelection: (productId: number, memberId: number) => void;
  getParticipantStatus: (productId: number, memberId: number) => ParticipantSelectionStatus;
  getSelectedParticipantCount: (productId: number) => number;
  getParticipantSelectionsForProduct: (productId: number) => Record<number, ParticipantSelectionStatus>;
  initializeParticipantSelections: (productId: number, memberIds: number[]) => void;
  resetParticipantSelections: (productId: number) => void;

  setSettlementItems: (roomId: string, items: SettlementItem[]) => void;
  appendSettlementItems: (roomId: string, items: SettlementItem[]) => void;
  updateSettlementItemPayers: (roomId: string, itemId: string, payerIds: number[]) => void;
  markTransferDone: (roomId: string, fromMemberId: number, toMemberId: number, done: boolean) => void;
}

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  participantSelections: {},
  settlementItemsByRoom: {},
  transferStatusByRoom: {},

  toggleParticipantSelection: (productId: number, memberId: number) => {
    set((state) => {
      const productSelections = state.participantSelections[productId] || {};
      const currentStatus = productSelections[memberId] || 'checked';
      const newStatus: ParticipantSelectionStatus = currentStatus === 'checked' ? 'unchecked' : 'checked';

      return {
        participantSelections: {
          ...state.participantSelections,
          [productId]: {
            ...productSelections,
            [memberId]: newStatus,
          },
        },
      };
    });
  },

  getParticipantStatus: (productId: number, memberId: number): ParticipantSelectionStatus => {
    const state = get();
    return state.participantSelections[productId]?.[memberId] || 'checked';
  },

  getSelectedParticipantCount: (productId: number): number => {
    const state = get();
    const productSelections = state.participantSelections[productId] || {};
    return Object.values(productSelections).filter((status) => status === 'checked').length;
  },

  getParticipantSelectionsForProduct: (productId: number): Record<number, ParticipantSelectionStatus> => {
    const state = get();
    return state.participantSelections[productId] || {};
  },

  initializeParticipantSelections: (productId: number, memberIds: number[]) => {
    set((state) => {
      if (state.participantSelections[productId]) {
        return state;
      }

      const initialSelections: Record<number, ParticipantSelectionStatus> = {};
      memberIds.forEach((memberId) => {
        initialSelections[memberId] = 'checked';
      });

      return {
        participantSelections: {
          ...state.participantSelections,
          [productId]: initialSelections,
        },
      };
    });
  },

  resetParticipantSelections: (productId: number) => {
    set((state) => {
      const newSelections = { ...state.participantSelections };
      delete newSelections[productId];
      return {
        participantSelections: newSelections,
      };
    });
  },

  setSettlementItems: (roomId: string, items: SettlementItem[]) => {
    set((state) => ({
      settlementItemsByRoom: {
        ...state.settlementItemsByRoom,
        [roomId]: items,
      },
    }));
  },

  appendSettlementItems: (roomId: string, items: SettlementItem[]) => {
    if (items.length === 0) return;
    set((state) => ({
      settlementItemsByRoom: {
        ...state.settlementItemsByRoom,
        [roomId]: [...(state.settlementItemsByRoom[roomId] ?? []), ...items],
      },
    }));
  },

  updateSettlementItemPayers: (roomId: string, itemId: string, payerIds: number[]) => {
    set((state) => ({
      settlementItemsByRoom: {
        ...state.settlementItemsByRoom,
        [roomId]: (state.settlementItemsByRoom[roomId] ?? []).map((item) =>
          item.id === itemId ? { ...item, payerIds } : item,
        ),
      },
    }));
  },

  markTransferDone: (roomId: string, fromMemberId: number, toMemberId: number, done: boolean) => {
    const key = `${fromMemberId}->${toMemberId}`;
    set((state) => ({
      transferStatusByRoom: {
        ...state.transferStatusByRoom,
        [roomId]: {
          ...(state.transferStatusByRoom[roomId] ?? {}),
          [key]: done,
        },
      },
    }));
  },
}));
