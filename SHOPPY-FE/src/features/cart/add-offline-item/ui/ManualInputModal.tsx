import React, { useState } from 'react';
import './ManualInputModal.css';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (productName: string, quantity: number) => void;
}

/**
 * 수동입력 모달 컴포넌트
 * 오프라인 장바구니에 상품을 수동으로 추가할 수 있는 모달
 */
const ManualInputModal: React.FC<ManualInputModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleSubmit = () => {
    if (productName.trim()) {
      onAdd(productName.trim(), quantity);
      setProductName('');
      setQuantity(1);
      onClose();
    }
  };

  const handleCancel = () => {
    setProductName('');
    setQuantity(1);
    onClose();
  };

  return (
    <div className="manual-input-modal-overlay" onClick={handleCancel}>
      <div className="manual-input-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="manual-input-modal-title">수동 입력</h2>
        
        <div className="manual-input-form">
          <div className="manual-input-field">
            <label className="manual-input-label">상품명</label>
            <input
              type="text"
              className="manual-input-text"
              placeholder="30자 이내로 작성해 주세요."
              value={productName}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 30) {
                  setProductName(value);
                }
              }}
              maxLength={30}
            />
          </div>

          <div className="manual-input-field">
            <label className="manual-input-label">수량</label>
            <div className="manual-input-quantity">
              <button
                className="manual-input-quantity-btn"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
                aria-label="수량 감소"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="manual-input-quantity-value">{quantity}</span>
              <button
                className="manual-input-quantity-btn"
                onClick={handleQuantityIncrease}
                aria-label="수량 증가"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="manual-input-modal-actions">
          <button
            className="manual-input-cancel-btn"
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            className="manual-input-submit-btn"
            onClick={handleSubmit}
            disabled={!productName.trim()}
          >
            장바구니에 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualInputModal;
