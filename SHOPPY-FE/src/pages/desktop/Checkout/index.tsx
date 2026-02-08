import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingList } from '@/entities/shopping/api/shopping';
import { getProductList } from '@/entities/product/api/productListApi';
import { calcOnlineCartTotal } from '@/features/cart/calculate-online-total/model/calcOnlineCartTotal';
import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';
import type { ProductMetaMap } from '@/features/cart/calculate-online-total/model/calcOnlineCartTotal';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import { getRoomMembers } from '@/entities/room/api/room';
import { createSettlement, updateSettlementDraft } from '@/entities/settlement/api/settlementApi';
import { mapSettlementResponseToStoreItems } from '@/entities/settlement/model/mapper';
import './styles.css';

const isOnlineItem = (item: ShoppingItem) => item.purchaseType === 'online';

const DesktopCheckoutPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const appendSettlementItems = useSettlementStore((state) => state.appendSettlementItems);
  const setSettlementId = useSettlementStore((state) => state.setSettlementId);
  const setSettlementItems = useSettlementStore((state) => state.setSettlementItems);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'kakao' | 'naver'>('card');
  const [onlineItems, setOnlineItems] = useState<ShoppingItem[]>([]);
  const [productMetaMap, setProductMetaMap] = useState<ProductMetaMap>({});
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const loadCartData = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const [cartRes, productResult] = await Promise.all([getShoppingList(roomId), getProductList()]);
      const items = cartRes.items.filter(isOnlineItem);
      setOnlineItems(items);

      const map: ProductMetaMap = {};
      productResult.products.forEach((p) => {
        map[p.product_id] = { imageUrl: p.image_url, price: p.price };
      });
      setProductMetaMap(map);
    } catch (err) {
      console.error('결제 페이지 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void loadCartData();
  }, [loadCartData]);

  const productTotal = calcOnlineCartTotal(onlineItems, productMetaMap);
  const deliveryFee = 0;
  const totalAmount = productTotal + deliveryFee;

  const handlePayment = async () => {
    if (!roomId) return;
    if (loading || onlineItems.length === 0) return;

    setIsProcessing(true);

    const paidItems = onlineItems.map((item) => {
      const price = item.productId != null ? (productMetaMap[item.productId]?.price ?? 0) : 0;
      return {
        id: `online-${roomId}-${item.shoppingItemId}-${Date.now()}`,
        name: item.displayName,
        quantity: item.quantity ?? 1,
        price,
        payerIds: [],
        payerBankName: '',
        payerAccountNumber: '',
        sourceType: 'online' as const,
        sourceLabel: '온라인 품목',
      };
    });

    setSettlementId(roomId, 0);
    localStorage.removeItem(`settlement:id:${roomId}`);
    appendSettlementItems(roomId, paidItems);

    const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');
    if (Number.isFinite(currentMemberId) && currentMemberId > 0) {
      try {
        const created = await createSettlement(roomId, {
          payerMemberId: currentMemberId,
          totalAmount,
          items: paidItems.map((item) => ({
            itemName: item.name,
            unitPrice: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            payerMemberId: currentMemberId,
            payerBankName: bankName.trim(),
            payerAccountNumber: accountNumber.trim(),
            sourceType: item.sourceType,
            sourceLabel: item.sourceLabel,
            receiptTitle: item.receiptTitle,
          })),
        });

        setSettlementId(roomId, created.purchaseId);
        localStorage.setItem(`settlement:id:${roomId}`, String(created.purchaseId));
        const bankPayload = {
          payerBankName: bankName.trim(),
          payerAccountNumber: accountNumber.trim(),
        };
        const paidItemsWithBank = paidItems.map((item) => ({
          ...item,
          ...bankPayload,
        }));
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(created, paidItemsWithBank));

        const members = await getRoomMembers(roomId);
        const memberIds = members.map((member) => member.memberId);
        const participantIds = Array.from(new Set([...memberIds, currentMemberId]));

        await updateSettlementDraft(created.purchaseId, {
          payerMemberId: currentMemberId,
          participantIds,
          items: created.items.map((serverItem, index) => ({
            purchaseItemId: serverItem.purchaseItemId,
            itemName: serverItem.itemName,
            unitPrice: serverItem.unitPrice,
            quantity: serverItem.quantity,
            payerMemberId: currentMemberId,
            payerBankName: bankName.trim(),
            payerAccountNumber: accountNumber.trim(),
            participantIds,
            sourceType: paidItems[index]?.sourceType,
            sourceLabel: paidItems[index]?.sourceLabel,
            receiptTitle: paidItems[index]?.receiptTitle,
          })),
        });
      } catch (error) {
        console.error('온라인 정산 draft 생성 실패:', error);
      }
    }

    try {
      // keep shopping items for mobile online matching
    } catch (err) {
      console.error('장바구니 정리 실패:', err);
    }

    window.dispatchEvent(new CustomEvent('cart-updated'));

    setTimeout(() => {
      navigate(`/rooms/${roomId}/settlement`);
    }, 1000);
  };

  const handleBack = () => {
    const message = `작성 중인 결제 정보가 초기화됩니다. \n정말 이전 페이지로 돌아가시겠습니까?`;
    if (window.confirm(message) && roomId) {
      navigate(`/rooms/${roomId}`);
    }
  };

  return (
    <div className="checkout-page" data-room-id={roomId}>
      <div className="checkout-top-actions">
        <button type="button" className="checkout-back-btn" onClick={handleBack}>
          뒤로가기
        </button>
        <button
          type="button"
          className="checkout-go-settlement-btn"
          onClick={() => navigate(`/rooms/${roomId}/settlement`)}
        >
          정산 페이지
        </button>
      </div>

      <div className="checkout-container">
        <h1 className="checkout-page-title">주문/결제</h1>

        <section className="checkout-section">
          <h2 className="checkout-section-title">주문 상품</h2>
          {loading ? (
            <p className="checkout-order-hint">로딩 중...</p>
          ) : onlineItems.length === 0 ? (
            <p className="checkout-order-hint">장바구니에 담긴 온라인 상품이 없습니다.</p>
          ) : (
            <div className="checkout-order-list">
              {onlineItems.map((item) => {
                const meta = item.productId != null ? productMetaMap[item.productId] : undefined;
                const price = meta?.price ?? 0;
                const qty = item.quantity ?? 1;
                const itemTotal = price * qty;

                return (
                  <div key={item.shoppingItemId} className="checkout-order-item">
                    <div className="checkout-order-thumb">
                      {meta?.imageUrl ? (
                        <img src={meta.imageUrl} alt={item.displayName} referrerPolicy="no-referrer" />
                      ) : (
                        <span>이미지</span>
                      )}
                    </div>
                    <div className="checkout-order-info">
                      <span className="checkout-order-name">{item.displayName}</span>
                      <span className="checkout-order-option">수량 {qty}개</span>
                    </div>
                    <span className="checkout-order-price">{itemTotal.toLocaleString()}원</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="checkout-section">
          <h2 className="checkout-section-title">배송지 정보</h2>
          <div className="checkout-form">
            <div className="checkout-form-row">
              <label className="checkout-label">받는 분</label>
              <input type="text" className="checkout-input" placeholder="이름을 입력하세요" />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">연락처</label>
              <input type="tel" className="checkout-input" placeholder="010-0000-0000" />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">배송 주소</label>
              <div className="checkout-address-row">
                <input type="text" className="checkout-input checkout-input--postcode" placeholder="우편번호" readOnly />
                <button type="button" className="checkout-address-search">
                  주소 검색
                </button>
              </div>
              <input type="text" className="checkout-input" placeholder="기본 주소" readOnly />
              <input type="text" className="checkout-input" placeholder="상세 주소" />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">은행명</label>
              <input
                type="text"
                className="checkout-input"
                placeholder="은행명을 입력하세요"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
              />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">계좌번호</label>
              <input
                type="text"
                className="checkout-input"
                placeholder="계좌번호를 입력하세요"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="checkout-section">
          <h2 className="checkout-section-title">결제 수단</h2>
          <div className="checkout-payment-methods">
            <label className={`checkout-payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <span className="checkout-payment-text">신용/체크카드</span>
            </label>
            <label className={`checkout-payment-option ${paymentMethod === 'transfer' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
              />
              <span className="checkout-payment-text">계좌이체</span>
            </label>
            <label className={`checkout-payment-option ${paymentMethod === 'kakao' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="kakao"
                checked={paymentMethod === 'kakao'}
                onChange={() => setPaymentMethod('kakao')}
              />
              <span className="checkout-payment-text">카카오페이</span>
            </label>
            <label className={`checkout-payment-option ${paymentMethod === 'naver' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="naver"
                checked={paymentMethod === 'naver'}
                onChange={() => setPaymentMethod('naver')}
              />
              <span className="checkout-payment-text">네이버페이</span>
            </label>
          </div>
        </section>

        <section className="checkout-section checkout-summary">
          <h2 className="checkout-section-title">결제 금액</h2>
          <div className="checkout-summary-rows">
            <div className="checkout-summary-row">
              <span>상품 금액</span>
              <span>{productTotal.toLocaleString()}원</span>
            </div>
            <div className="checkout-summary-row">
              <span>배송비</span>
              <span>{deliveryFee.toLocaleString()}원</span>
            </div>
            <div className="checkout-summary-row checkout-summary-row--total">
              <span>총 결제 금액</span>
              <strong>{totalAmount.toLocaleString()}원</strong>
            </div>
          </div>
        </section>

        <div className="checkout-actions">
          <button
            type="button"
            className="checkout-submit-btn"
            disabled={loading || onlineItems.length === 0 || isProcessing}
            onClick={handlePayment}
          >
            {paymentMethod === 'kakao' && '카카오페이로 결제하기'}
            {paymentMethod === 'naver' && '네이버페이로 결제하기'}
            {(paymentMethod === 'card' || paymentMethod === 'transfer') && `${totalAmount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="checkout-overlay">
          <div className="checkout-overlay-content">
            <div className="checkout-overlay-icon">
              <i className="ri-checkbox-circle-fill"></i>
            </div>
            <h2 className="checkout-overlay-title">결제에 성공했습니다.</h2>
            <p className="checkout-overlay-message">정산 페이지로 이동합니다...</p>
            <div className="checkout-overlay-spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopCheckoutPage;
