import React, { useState } from 'react';
import './MobilePanels.css';

interface MobileCartPanelProps {
  onEndShopping?: () => void;
}

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  checked: boolean;
}

const MobileCartPanel: React.FC<MobileCartPanelProps> = ({ onEndShopping }) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [items, setItems] = useState<CartItem[]>([]);
  const [manualError, setManualError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCloseManual = () => {
    setShowManualInput(false);
    setManualName('');
    setManualQty(1);
    setManualError('');
  };

  const handleSubmitManual = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = manualName.trim();
    if (!trimmedName) {
      setManualError('상품명을 입력하세요.');
      return;
    }
    const normalizedName = trimmedName.toLowerCase();
    const exists = items.some((item) => item.name.toLowerCase() === normalizedName);
    if (exists) {
      setManualError('중복입니다.');
      return;
    }
    setManualError('');
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: trimmedName, quantity: manualQty, checked: false },
    ]);
    handleCloseManual();
  };

  const adjustQty = (delta: number) => {
    setManualQty((prev) => Math.max(1, prev + delta));
  };

  const updateItemQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }),
    );
  };

  const toggleChecked = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEndShopping = () => {
    const hasUnchecked = items.some((item) => !item.checked);
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

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">장바구니</div>
      <div className="mobile-panel-card cart-panel-card">
        <div className="mobile-panel-header">
          <div className="mobile-panel-title">현장 쇼핑 목록</div>
          <div className="mobile-panel-header-actions">
            <button
              type="button"
              className="mobile-panel-header-button"
              onClick={() => setShowManualInput(true)}
            >
              <i className="ri-add-line" aria-hidden="true" />
              수동 입력
            </button>
            <button type="button" className="mobile-panel-header-button">
              <i className="ri-mic-line" aria-hidden="true" />
              음성
            </button>
          </div>
        </div>
        <div className="mobile-cart-list">
          {items.length === 0 ? (
            <div className="mobile-panel-empty">등록된 상품이 없습니다.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={`mobile-cart-item ${item.checked ? 'checked' : ''}`}>
                <button
                  type="button"
                  className="mobile-cart-item-button"
                  onClick={() => toggleChecked(item.id)}
                >
                  <span className="mobile-cart-item-name">{item.name}</span>
                </button>
                <div className="mobile-cart-qty">
                  <button
                    type="button"
                    className="mobile-cart-qty-btn"
                    onClick={() => updateItemQty(item.id, -1)}
                    aria-label="수량 감소"
                  >
                    <i className="ri-subtract-line" aria-hidden="true" />
                  </button>
                  <span className="mobile-cart-qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    className="mobile-cart-qty-btn"
                    onClick={() => updateItemQty(item.id, 1)}
                    aria-label="수량 증가"
                  >
                    <i className="ri-add-line" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  className="mobile-cart-delete"
                  onClick={() => removeItem(item.id)}
                  aria-label="삭제"
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
              <h3 className="mobile-manual-title">수동 입력</h3>
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
              <div className="mobile-manual-label">개수</div>
              <div className="mobile-manual-qty">
                <button
                  type="button"
                  className="mobile-manual-step"
                  onClick={() => adjustQty(-1)}
                  data-label="-"
                ></button>
                <span className="mobile-manual-qty-value">{manualQty}</span>
                <button
                  type="button"
                  className="mobile-manual-step"
                  onClick={() => adjustQty(1)}
                  data-label="+"
                ></button>
              </div>
              <div className="mobile-manual-actions">
                <button type="button" className="mobile-manual-cancel" onClick={handleCloseManual}>
                  취소
                </button>
                <button type="submit" className="mobile-manual-submit">
                  등록하기
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
            <div className="mobile-confirm-title">체크 안한 항목이 있습니다.</div>
            <div className="mobile-confirm-desc">정말로 넘어가시겠습니까?</div>
            <div className="mobile-confirm-actions">
              <button type="button" className="mobile-confirm-cancel" onClick={handleConfirmClose}>
                취소
              </button>
              <button
                type="button"
                className="mobile-confirm-submit"
                onClick={handleConfirmProceed}
              >
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
