import React, { useState, useEffect } from 'react';
import type { Participant } from '../../../types/participant.types';
import { getMemberList } from '../../../api/memberListApi';
import { useSettlementStore } from '../../../stores/useSettlementStore';
import ParticipantAvatar from './ParticipantAvatar/ParticipantAvatar';
import './CartItemParticipants.css';

interface CartItemParticipantsProps {
  productId: number;
  participantCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * 정산 참여자 
 * 토글이 열리면 API를 호출해, 정산 참여자 목록을 표시
 * 참여자 선택 상태는 전역 store에서 관리
 */
const CartItemParticipants: React.FC<CartItemParticipantsProps> = ({
  productId,
  participantCount,
  isExpanded,
  onToggle,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // 전역 store에서 참여자 선택 상태 관리
  const {
    getParticipantStatus,
    toggleParticipantSelection,
    initializeParticipantSelections,
  } = useSettlementStore();

  // 토글이 열릴 때 API 호출 및 초기화
  useEffect(() => {
    if (isExpanded && !hasFetched) {
      getMemberList()
        .then((data) => {
          setParticipants(data);
          // 전역 store에 참여자 목록 초기화 (기본값: 모두 'checked')
          const memberIds = data.map((p) => p.member_id);
          initializeParticipantSelections(productId, memberIds);
        })
        .catch((error) => {
          console.error('참여자 목록 조회 실패:', error);
        })
        .finally(() => {
          setHasFetched(true);
        });
    }
  }, [isExpanded, hasFetched, productId, initializeParticipantSelections]);

  // 로딩 상태는 계산으로 처리
  const loading = isExpanded && !hasFetched;

  // 참여자 선택 상태 토글 (전역 store 사용)
  const handleStatusToggle = (memberId: number) => {
    toggleParticipantSelection(productId, memberId);
  };

  return (
    <>
      <div className="participants-wrapper">
        <button
          className="participants-toggle-btn"
          onClick={onToggle}
          aria-label="참여자 목록"
          aria-expanded={isExpanded}
        >
          <i className="ri-user-line"></i>
          <span>{participantCount}</span>
        </button>
      </div>

      {/* 토글이 열렸을 때 참여자 목록 표시 - footer 아래에 별도로 표시 */}
      {isExpanded && (
        <div className="participants-list-container">
          <div className="participants-list-header">
            <h4>정산 참여자</h4>
          </div>
          <div className="participants-list-content">
            {loading ? (
              <div className="participants-loading">
                <p>로딩 중...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="participants-empty">
                <p>참여자가 없습니다.</p>
              </div>
            ) : (
              <div className="participants-list">
                {participants.map((participant) => (
                  <ParticipantAvatar
                    key={participant.member_id}
                    participant={participant}
                    status={getParticipantStatus(productId, participant.member_id)}
                    onStatusToggle={handleStatusToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CartItemParticipants;
