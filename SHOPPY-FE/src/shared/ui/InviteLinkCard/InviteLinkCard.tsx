import React, { useState } from 'react';
import './InviteLinkCard.css';

interface InviteLinkCardPayload {
  link: string;
  nickname: string;
}

interface InviteLinkCardProps {
  onClose: () => void;
  onEnter: (payload: InviteLinkCardPayload) => void;
  loading?: boolean;
  error?: string | null;
}

const InviteLinkCard: React.FC<InviteLinkCardProps> = ({
  onClose,
  onEnter,
  loading = false,
  error = null,
}) => {
  const [link, setLink] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onEnter({ link, nickname });
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
          <h2 className="invite-card-title">공유 쇼핑 참가하기</h2>
          <button type="button" className="invite-card-close" onClick={onClose}>
            x
          </button>
        </div>
        <form className="invite-card-body" onSubmit={handleSubmit}>
          <label htmlFor="inviteNickname" className="invite-card-label">
            닉네임
          </label>
          <input
            id="inviteNickname"
            className="invite-card-input"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <label htmlFor="inviteLink" className="invite-card-label">
            초대 코드
          </label>
          <input
            id="inviteLink"
            className="invite-card-input"
            type="text"
            placeholder="초대 코드를 입력하세요"
            value={link}
            onChange={(event) => setLink(event.target.value)}
          />
          {error && <p className="invite-card-error">{error}</p>}
          <button type="submit" className="invite-card-enter" disabled={loading}>
            {loading ? '입장중 ... ' : '입장하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteLinkCard;
