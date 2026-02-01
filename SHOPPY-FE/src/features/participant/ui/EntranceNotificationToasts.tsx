import React from 'react';
import { Toast } from '@/shared/ui/Toast';
import { useEntranceNotificationStore } from '../model/useEntranceNotificationStore';
import './EntranceNotificationToasts.css';

const EntranceNotificationToasts: React.FC = () => {
  const toasts = useEntranceNotificationStore((state) => state.toasts);
  const removeToast = useEntranceNotificationStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="entrance-notification-toasts" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className="entrance-notification-toasts__item">
          <Toast
            variant="entrance"
            title="입장 알림"
            body={`"${item.nickname}"님이 입장하셨습니다.\n마이크를 켜고 인사를 나눠보세요. `}
            onClose={() => removeToast(item.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default EntranceNotificationToasts;
