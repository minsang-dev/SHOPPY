import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShoppingItems } from '../../../features/shopping/cart/model/useShoppingItems';
import './MobilePanels.css';

interface MobileCartPanelProps {
  roomId?: string;
  onEndShopping?: () => void;
}

const MobileCartPanel: React.FC<MobileCartPanelProps> = ({ roomId, onEndShopping }) => {
  const { items, loading, error, addItem, toggleChecked, removeItem } = useShoppingItems(roomId);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualError, setManualError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any>(null);
  const speechStopTimerRef = useRef<number | null>(null);
  const voiceToastTimerRef = useRef<number | null>(null);

  const handleCloseManual = () => {
    setShowManualInput(false);
    setManualName('');
    setManualError('');
  };

  const handleSubmitManual = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = manualName.trim();
    if (!trimmedName) {
      setManualError('상품명을 입력해주세요.');
      return;
    }

    const normalizedName = trimmedName.toLowerCase();
    const exists = items.some((item) => item.name.toLowerCase() === normalizedName);
    if (exists) {
      setManualError('이미 추가된 상품입니다.');
      return;
    }

    setManualError('');
    await addItem(trimmedName, 1);
    handleCloseManual();
  };

  const handleToggleChecked = async (id: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    await toggleChecked(id, !current.checked);
  };

  const handleRemoveItem = async (id: number) => {
    await removeItem(id);
  };

  const visibleItems = items.filter((item) => item.purchaseType !== 'online');

  const handleEndShopping = () => {
    const hasUnchecked = visibleItems.some((item) => !item.checked);
    if (hasUnchecked) {
      setShowConfirm(true);
      return;
    }
    onEndShopping?.();
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
  };

  const handleConfirmProceed = () => {
    setShowConfirm(false);
    onEndShopping?.();
  };

  const showVoiceToast = useCallback((message: string) => {
    setVoiceToast(message);
    if (voiceToastTimerRef.current) {
      window.clearTimeout(voiceToastTimerRef.current);
    }
    voiceToastTimerRef.current = window.setTimeout(() => {
      setVoiceToast(null);
      voiceToastTimerRef.current = null;
    }, 2200);
  }, []);

  const parseVoiceItem = useCallback((rawText: string) => {
    const text = rawText.trim().replace(/\s+/g, ' ');
    const quantityMatch = text.match(/^(.+?)\s+(\d+)\s*\D*$/);
    if (quantityMatch) {
      const name = quantityMatch[1].trim();
      const quantity = Math.max(1, Number(quantityMatch[2]));
      return { name, quantity };
    }
    return { name: text, quantity: 1 };
  }, []);

  const ensureAudioPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      showVoiceToast('마이크 권한을 허용해주세요.');
      return false;
    }
  }, [showVoiceToast]);

  const handleVoiceToggle = useCallback(async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showVoiceToast('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isRecording && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      return;
    }

    const hasPermission = await ensureAudioPermission();
    if (!hasPermission) return;

    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim() ?? '';
      if (!transcript) {
        showVoiceToast('음성을 인식하지 못했습니다.');
        return;
      }

      const { name, quantity } = parseVoiceItem(transcript);
      if (!name) {
        showVoiceToast('상품명을 인식하지 못했습니다.');
        return;
      }

      void addItem(name, quantity);
    };

    recognition.onerror = (event: { error?: string }) => {
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        showVoiceToast('마이크 권한이 필요합니다.');
        return;
      }
      if (event?.error === 'audio-capture') {
        showVoiceToast('마이크를 찾을 수 없습니다.');
        return;
      }
      if (event?.error === 'no-speech') {
        showVoiceToast('음성이 감지되지 않았습니다.');
        return;
      }
      showVoiceToast('음성 인식에 실패했습니다.');
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (speechStopTimerRef.current) {
        window.clearTimeout(speechStopTimerRef.current);
        speechStopTimerRef.current = null;
      }
      speechRecognitionRef.current = null;
    };

    try {
      recognition.start();
      setIsRecording(true);
      speechStopTimerRef.current = window.setTimeout(() => {
        recognition.stop();
      }, 5000);
    } catch {
      setIsRecording(false);
      showVoiceToast('마이크를 시작하지 못했습니다.');
    }
  }, [addItem, ensureAudioPermission, isRecording, parseVoiceItem, showVoiceToast]);

  useEffect(() => {
    return () => {
      if (speechStopTimerRef.current) {
        window.clearTimeout(speechStopTimerRef.current);
      }
      if (voiceToastTimerRef.current) {
        window.clearTimeout(voiceToastTimerRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // noop
        }
      }
    };
  }, []);

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-card cart-panel-card">
        <div className="mobile-panel-header">
          <div className="mobile-panel-title">장바구니</div>
          <div className="mobile-panel-header-actions">
            <button
              type="button"
              className="mobile-panel-header-button"
              onClick={() => setShowManualInput(true)}
              disabled={isRecording}
            >
              <i className="ri-add-line" aria-hidden="true" />
              항목 추가
            </button>
            <button
              type="button"
              className={`mobile-panel-header-button ${isRecording ? 'is-recording' : ''}`}
              onClick={() => {
                void handleVoiceToggle();
              }}
              aria-pressed={isRecording}
            >
              <i className="ri-mic-line" aria-hidden="true" />
              {isRecording ? '듣는 중..' : '음성입력'}
            </button>
          </div>
        </div>

        <div className="mobile-cart-list">
          {voiceToast && <div className="mobile-panel-voice-toast">{voiceToast}</div>}
          {loading ? (
            <div className="mobile-panel-empty">로딩 중...</div>
          ) : error ? (
            <div className="mobile-panel-empty">{error}</div>
          ) : visibleItems.length === 0 ? (
            <div className="mobile-panel-empty">등록된 상품이 없습니다.</div>
          ) : (
            visibleItems.map((item) => (
              <div key={item.id} className={`mobile-cart-item ${item.checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  className="mobile-cart-checkbox"
                  checked={item.checked}
                  onChange={() => void handleToggleChecked(item.id)}
                />
                <span className="mobile-cart-item-name">{item.name}</span>
                <button
                  type="button"
                  className="mobile-cart-delete"
                  onClick={() => void handleRemoveItem(item.id)}
                  aria-label="항목 삭제"
                >
                  <i className="ri-delete-bin-line" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mobile-panel-actions single">
        <button type="button" className="mobile-panel-action is-danger" onClick={handleEndShopping}>
          쇼핑 종료
        </button>
      </div>

      {showManualInput && (
        <div className="mobile-manual-modal">
          <div className="mobile-manual-backdrop" onClick={handleCloseManual} />
          <div className="mobile-manual-card">
            <div className="mobile-manual-header">
              <h3 className="mobile-manual-title">항목 추가</h3>
              <button type="button" className="mobile-manual-close" onClick={handleCloseManual}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <form className="mobile-manual-form" onSubmit={handleSubmitManual}>
              <label className="mobile-manual-label" htmlFor="manual-item-name">
                상품명
              </label>
              <input
                id="manual-item-name"
                className="mobile-manual-input"
                type="text"
                value={manualName}
                placeholder="상품명을 입력하세요"
                onChange={(event) => {
                  setManualName(event.target.value);
                  if (manualError) {
                    setManualError('');
                  }
                }}
              />
              {manualError && <div className="mobile-manual-error">{manualError}</div>}
              <div className="mobile-manual-actions">
                <button type="button" className="mobile-manual-cancel" onClick={handleCloseManual}>
                  취소
                </button>
                <button type="submit" className="mobile-manual-submit">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="mobile-confirm-modal">
          <div className="mobile-confirm-backdrop" onClick={handleConfirmClose} />
          <div className="mobile-confirm-card">
            <div className="mobile-confirm-title">체크하지 않은 항목이 있어요</div>
            <div className="mobile-confirm-desc">정말로 쇼핑을 종료할까요?</div>
            <div className="mobile-confirm-actions">
              <button type="button" className="mobile-confirm-cancel" onClick={handleConfirmClose}>
                취소
              </button>
              <button type="button" className="mobile-confirm-submit" onClick={handleConfirmProceed}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MobileCartPanel;
