import { create } from 'zustand';

export type ParticipantSelectionStatus = 'checked' | 'unchecked';

// 실제 데이터 구조: 상품 id -> 참여자 id -> 선택 상태
// {
//   101번_상품(피자): {
//     1번_철수: "checked",  // 철수는 냄
//     2번_영희: "unchecked" // 영희는 안 냄
//   },
// }

interface SettlementStore {
  participantSelections: Record<number, Record<number, ParticipantSelectionStatus>>;

  // 참여자 선택 상태 토글
  toggleParticipantSelection: (productId: number, memberId: number) => void;

  // 특정 상품의 참여자 선택 상태 가져오기
  getParticipantStatus: (productId: number, memberId: number) => ParticipantSelectionStatus;

  // 특정 상품의 선택된 참여자 수 가져오기
  getSelectedParticipantCount: (productId: number) => number;

  // 특정 상품의 모든 참여자 선택 상태 가져오기
  getParticipantSelectionsForProduct: (productId: number) => Record<number, ParticipantSelectionStatus>;

  // 상품별 참여자 목록 초기화 (API에서 받아온 참여자 목록으로 기본값 설정)
  initializeParticipantSelections: (productId: number, memberIds: number[]) => void;

  // 상품별 참여자 선택 상태 초기화
  resetParticipantSelections: (productId: number) => void;
}

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  // 초기 상태
  participantSelections: {},

  // 참여자 선택 상태 토글
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

  // 특정 상품의 참여자 선택 상태 가져오기
  getParticipantStatus: (productId: number, memberId: number): ParticipantSelectionStatus => {
    const state = get();
    return state.participantSelections[productId]?.[memberId] || 'checked';
  },

  // 특정 상품의 선택된 참여자 수 가져오기
  getSelectedParticipantCount: (productId: number): number => {
    const state = get();
    const productSelections = state.participantSelections[productId] || {};
    return Object.values(productSelections).filter((status) => status === 'checked').length;
  },

  // 특정 상품의 모든 참여자 선택 상태 가져오기
  getParticipantSelectionsForProduct: (productId: number): Record<number, ParticipantSelectionStatus> => {
    const state = get();
    return state.participantSelections[productId] || {};
  },

  // 상품별 참여자 목록 초기화 (기본값은 모두 'checked')
  initializeParticipantSelections: (productId: number, memberIds: number[]) => {
    set((state) => {
      // 이미 초기화되어 있으면 스킵
      if (state.participantSelections[productId]) {
        return state;
      }

      // 모든 참여자를 'checked' 상태로 초기화
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

  // 상품별 참여자 선택 상태 초기화
  resetParticipantSelections: (productId: number) => {
    set((state) => {
      const newSelections = { ...state.participantSelections };
      delete newSelections[productId];
      return {
        participantSelections: newSelections,
      };
    });
  },
}));
