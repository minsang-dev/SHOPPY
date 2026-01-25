import React from 'react';
import { useParticipantsForProduct } from '../../../../features/participant/fetch-members/model/useParticipantsForProduct';
import ParticipantAvatar from './ParticipantAvatar/ParticipantAvatar';
import './CartItemParticipants.css';

interface CartItemParticipantsProps {
  productId: number;
  participantCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const CartItemParticipants: React.FC<CartItemParticipantsProps> = ({
  productId,
  participantCount,
  isExpanded,
  onToggle,
}) => {
  const {
    participants,
    loading,
    error,
    getParticipantStatus,
    toggleParticipantSelection,
  } = useParticipantsForProduct(productId, isExpanded);

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
            ) : error ? (
              <div className="participants-empty">
                <p>{error}</p>
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
