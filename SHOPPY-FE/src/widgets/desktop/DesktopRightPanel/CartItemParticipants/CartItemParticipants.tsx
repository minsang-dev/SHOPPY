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

/**
 * ?뺤궛 李몄뿬??
 * ?좉????대━硫?API瑜??몄텧?? ?뺤궛 李몄뿬??紐⑸줉???쒖떆
 * 李몄뿬???좏깮 ?곹깭???꾩뿭 store?먯꽌 愿由?
 */
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

  // 李몄뿬???좏깮 ?곹깭 ?좉? (?꾩뿭 store ?ъ슜)
  const handleStatusToggle = (memberId: number) => {
    toggleParticipantSelection(productId, memberId);
  };

  return (
    <>
      <div className="participants-wrapper">
        <button
          className="participants-toggle-btn"
          onClick={onToggle}
          aria-label="李몄뿬??紐⑸줉"
          aria-expanded={isExpanded}
        >
          <i className="ri-user-line"></i>
          <span>{participantCount}</span>
        </button>
      </div>

      {/* ?좉????대졇????李몄뿬??紐⑸줉 ?쒖떆 - footer ?꾨옒??蹂꾨룄濡??쒖떆 */}
      {isExpanded && (
        <div className="participants-list-container">
          <div className="participants-list-header">
            <h4>정산 참여자</h4>
          </div>
          <div className="participants-list-content">
            {loading ? (
              <div className="participants-loading">
                <p>濡쒕뵫 以?..</p>
              </div>
            ) : error ? (
              <div className="participants-empty">
                <p>{error}</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="participants-empty">
                <p>李몄뿬?먭? ?놁뒿?덈떎.</p>
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

