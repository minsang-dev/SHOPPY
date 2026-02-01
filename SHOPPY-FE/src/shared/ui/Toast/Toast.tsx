import React from 'react';
import './Toast.css';

export type ToastVariant = 'default' | 'entrance' | 'cart';

export interface ToastProps {
  title: string;
  body: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, body, variant = 'default', onClose }) => {
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
