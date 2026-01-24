import React, { useState } from 'react';
import './InviteLinkCard.css';

interface InviteLinkCardProps {
  onClose: () => void;
  onEnter: (link?: string) => void;
}

const InviteLinkCard: React.FC<InviteLinkCardProps> = ({ onClose, onEnter }) => {
  const [link, setLink] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onEnter(link);
  };

  return (
    <div className="invite-card-backdrop" onClick={onClose}>
      <div className="invite-card" onClick={(event) => event.stopPropagation()}>
        <div className="invite-card-header">
          <img
            src="/images/shoppingMall_main_logo.png"
            alt="SHOPPY Logo"
            className="invite-card-logo"
          />
          <h2 className="invite-card-title">초대 링크 등록하기</h2>
          <button type="button" className="invite-card-close" onClick={onClose}>
            x
          </button>
        </div>
        <form className="invite-card-body" onSubmit={handleSubmit}>
          <label htmlFor="inviteLink" className="invite-card-label">
            공유 받은 초대 링크
          </label>
          <input
            id="inviteLink"
            className="invite-card-input"
            type="text"
            placeholder="https://shoppy.app/room/..."
            value={link}
            onChange={(event) => setLink(event.target.value)}
          />
          <button type="submit" className="invite-card-enter">
            쇼핑룸 입장하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteLinkCard;
