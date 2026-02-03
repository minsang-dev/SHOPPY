import React from 'react';
import { Toast } from '@/shared/ui/Toast';
import { useVoteNotificationStore } from '../model/useVoteNotificationStore';
import './VoteNotificationToasts.css';

const VoteNotificationToasts: React.FC = () => {
  const toasts = useVoteNotificationStore((state) => state.toasts);
  const removeToast = useVoteNotificationStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="vote-notification-toasts" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className="vote-notification-toasts__item">
          <Toast
            title={item.title}
            body={`"${item.voteSubject}" 투표가 생성되었습니다.\n 지금 참여해 보세요.`}
            onClose={() => removeToast(item.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default VoteNotificationToasts;
