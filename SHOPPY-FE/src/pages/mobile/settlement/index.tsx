import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

interface SettlementItem {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
  quantity?: number;
  payerIds?: string[];
}

const MobileSettlementPage: React.FC = () => {
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const items: SettlementItem[] = [];

  const totalAmount = items.reduce((sum, item) => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 1;
    return sum + price * quantity;
  }, 0);

  return (
    <div className="mobile-settlement-page">
      <div className="mobile-settlement-shell">
        <div className="mobile-settlement-header">
          <button type="button" className="mobile-settlement-back" onClick={() => navigate(-1)}>
            <i className="ri-arrow-left-line" />
          </button>
          <h1 className="mobile-settlement-title">정산하기</h1>
          <div className="mobile-settlement-spacer" />
        </div>

        <div className="mobile-settlement-content">
          <section className="mobile-settlement-section">
            <h2 className="mobile-settlement-section-title">정산할 물품</h2>
            {items.length === 0 ? (
              <div className="mobile-settlement-empty">정산할 물품이 없습니다.</div>
            ) : (
              <div className="mobile-settlement-list">
                {items.map((item) => (
                  <article key={item.id} className="mobile-settlement-card">
                    <div className="mobile-settlement-card-head">
                      <div className="mobile-settlement-thumb">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <i className="ri-image-line" />
                        )}
                      </div>
                      <div className="mobile-settlement-name">{item.name}</div>
                    </div>
                    <div className="mobile-settlement-inputs">
                      <label className="mobile-settlement-field">
                        <span>가격</span>
                        <input type="number" value={item.price ?? 0} readOnly />
                      </label>
                      <label className="mobile-settlement-field">
                        <span>수량</span>
                        <input type="number" value={item.quantity ?? 1} readOnly />
                      </label>
                    </div>
                    <div className="mobile-settlement-divider" />
                    <div className="mobile-settlement-members">
                      <span>결제 인원</span>
                      <div className="mobile-settlement-member-list">
                        <div className="mobile-settlement-member-empty">선택된 인원이 없습니다.</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mobile-settlement-section">
            <div className="mobile-settlement-summary">
              <div className="mobile-settlement-total">
                <span>총 금액</span>
                <strong>{totalAmount.toLocaleString()}원</strong>
              </div>
              <div className="mobile-settlement-divider" />
              <div className="mobile-settlement-split">
                <span>각자 결제 금액</span>
                <div className="mobile-settlement-split-list">
                  <div className="mobile-settlement-split-empty">참여자 정산 내역이 없습니다.</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mobile-settlement-actions">
          <button
            type="button"
            className="mobile-settlement-action outline"
            onClick={() => setShowReceiptModal(true)}
          >
            <i className="ri-camera-line" />
            영수증 등록
          </button>
          <button
            type="button"
            className="mobile-settlement-action primary"
            onClick={() => navigate('/m/room')}
          >
            정산 완료
          </button>
        </div>
      </div>

      {showReceiptModal && (
        <div className="receipt-modal">
          <div className="receipt-modal-backdrop" onClick={() => setShowReceiptModal(false)} />
          <div className="receipt-modal-sheet">
            <div className="receipt-modal-header">
              <button type="button" className="receipt-modal-close" onClick={() => setShowReceiptModal(false)}>
                <i className="ri-close-line" />
              </button>
              <h2 className="receipt-modal-title">영수증 촬영</h2>
              <div className="receipt-modal-spacer" />
            </div>

            <div className="receipt-modal-body">
              <div className="receipt-camera-frame">
                <div className="receipt-camera-placeholder">
                  카메라 화면
                </div>
                <div className="receipt-frame-guide" />
              </div>
              <p className="receipt-guide-text">영수증을 프레임 안에 맞춰 촬영해주세요.</p>
            </div>

            <div className="receipt-modal-actions">
              <button type="button" className="receipt-action ghost">
                갤러리
              </button>
              <button type="button" className="receipt-action primary">
                촬영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSettlementPage;
