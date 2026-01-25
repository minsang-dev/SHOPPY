import React from 'react';
import './OfflineCartInput.css';

interface OfflineCartInputProps {
  isListening: boolean;
  onVoiceInput: () => void;
  onManualInput: () => void;
}

/**
 * 오프라인 장바구니 입력 컴포넌트
 * 음성입력과 수동입력 버튼을 제공
 */
const OfflineCartInput: React.FC<OfflineCartInputProps> = ({
  isListening,
  onVoiceInput,
  onManualInput,
}) => {
  return (
    <div className="offline-cart-input">
      <button
        className={`offline-input-btn voice-input-btn ${isListening ? 'active' : ''}`}
        onClick={onVoiceInput}
        aria-label="음성입력"
        disabled={isListening}
      >
        <i className="ri-mic-line"></i>
        <span>{isListening ? '듣는 중..' : '음성입력'}</span>
      </button>
      <button
        className="offline-input-btn manual-input-btn"
        onClick={onManualInput}
        aria-label="수동입력"
        disabled={isListening}
      >
        <i className="ri-add-line"></i>
        <span>수동입력</span>
      </button>
    </div>
  );
};

export default OfflineCartInput;
