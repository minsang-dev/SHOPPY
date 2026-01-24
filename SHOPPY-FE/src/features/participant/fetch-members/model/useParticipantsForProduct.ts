import { useEffect, useMemo, useState } from 'react';
import { getMemberList } from '../../../../entities/participant/api/memberListApi';
import type { Participant, ParticipantSelectionStatus } from '../../../../entities/participant/types/participant.types';
import { useSettlementStore } from '../../../../entities/settlement/model/useSettlementStore';

interface UseParticipantsForProductResult {
  participants: Participant[];
  loading: boolean;
  error: string | null;
  getParticipantStatus: (productId: number, memberId: number) => ParticipantSelectionStatus;
  toggleParticipantSelection: (productId: number, memberId: number) => void;
}

export const useParticipantsForProduct = (
  productId: number,
  isExpanded: boolean,
): UseParticipantsForProductResult => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    getParticipantStatus,
    toggleParticipantSelection,
    initializeParticipantSelections,
  } = useSettlementStore();

  useEffect(() => {
    if (!isExpanded || hasFetched) {
      return;
    }

    let cancelled = false;

    getMemberList()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setParticipants(data);
        const memberIds = data.map((participant) => participant.member_id);
        initializeParticipantSelections(productId, memberIds);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setError('참여자 목록을 불러오는데 실패했습니다.');
        console.error('참여자 목록 조회 실패:', err);
      })
      .finally(() => {
        if (!cancelled) {
          setHasFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasFetched, initializeParticipantSelections, isExpanded, productId]);

  const loading = useMemo(() => isExpanded && !hasFetched, [hasFetched, isExpanded]);

  return {
    participants,
    loading,
    error,
    getParticipantStatus,
    toggleParticipantSelection,
  };
};
