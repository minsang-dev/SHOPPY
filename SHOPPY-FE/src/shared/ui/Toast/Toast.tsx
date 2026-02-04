import React, { useEffect, useRef } from 'react';
import './Toast.css';

export type ToastVariant = 'default' | 'entrance' | 'cart';

const AUTO_CLOSE_MS = 3000;

export interface ToastProps {
  title: string;
  body: string;
  variant?: ToastVariant;
  onClose: () => void;
  autoCloseAfterMs?: number;
}

const Toast: React.FC<ToastProps> = ({
  title,
  body,
  variant = 'default',
  onClose,
  autoCloseAfterMs = AUTO_CLOSE_MS,
}) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (autoCloseAfterMs <= 0) return;
    const timer = window.setTimeout(() => {
      onCloseRef.current();
    }, autoCloseAfterMs);
    return () => window.clearTimeout(timer);
  }, [autoCloseAfterMs]);

  return (
    <div
      className={`toast ${variant === 'entrance' ? 'toast--entrance' : ''} ${variant === 'cart' ? 'toast--cart' : ''}`}
      role="alert"
    >
      <button
        type="button"
        className="toast__close"
        onClick={onClose}
        aria-label="알림 닫기"
      >
        ×
      </button>
      <div className="toast__header">
        <span className="toast__icon" aria-hidden />
        <h3 className="toast__title">{title}</h3>
      </div>
      <p className="toast__body">{body}</p>
    </div>
  );
};

export default Toast;
