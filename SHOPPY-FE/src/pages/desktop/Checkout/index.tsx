import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingList, deleteShoppingItem } from '@/entities/shopping/api/shopping';
import { getProductList } from '@/entities/product/api/productListApi';
import { calcOnlineCartTotal } from '@/features/cart/calculate-online-total/model/calcOnlineCartTotal';
import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';
import type { ProductMetaMap } from '@/features/cart/calculate-online-total/model/calcOnlineCartTotal';
import './styles.css';

const isOnlineItem = (item: ShoppingItem) => item.purchaseType === 'online';

const DesktopCheckoutPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'kakao' | 'naver'>('card');
  const [onlineItems, setOnlineItems] = useState<ShoppingItem[]>([]);
  const [productMetaMap, setProductMetaMap] = useState<ProductMetaMap>({});
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadCartData = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const [cartRes, products] = await Promise.all([
        getShoppingList(roomId),
        getProductList(),
      ]);
      const items = cartRes.items.filter(isOnlineItem);
      setOnlineItems(items);

      const map: ProductMetaMap = {};
      products.forEach((p) => {
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

    // 온라인 장바구니 상품 모두 삭제 (결제 완료 처리)
    try {
      await Promise.all(
        onlineItems.map((item) => deleteShoppingItem(roomId, item.shoppingItemId))
      );
    } catch (err) {
      console.error('장바구니 삭제 실패:', err);
    }

    // 장바구니 갱신 이벤트 발생 (다른 사용자에게도 반영)
    window.dispatchEvent(new CustomEvent('cart-updated'));

    setTimeout(() => {
      navigate(`/rooms/${roomId}`);
    }, 3000);
  };

  return (
    <div className="checkout-page" data-room-id={roomId}>
      <div className="checkout-container">
        <h1 className="checkout-page-title">주문/결제</h1>

        {/* 주문 내역 */}
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
                        <img
                          src={meta.imageUrl}
                          alt={item.displayName}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>이미지</span>
                      )}
                    </div>
                    <div className="checkout-order-info">
                      <span className="checkout-order-name">{item.displayName}</span>
                      <span className="checkout-order-option">수량 {qty}개</span>
                    </div>
                    <span className="checkout-order-price">
                      {itemTotal.toLocaleString()}원
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 배송지 입력 */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">배송지 정보</h2>
          <div className="checkout-form">
            <div className="checkout-form-row">
              <label className="checkout-label">받는 분</label>
              <input
                type="text"
                className="checkout-input"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">연락처</label>
              <input
                type="tel"
                className="checkout-input"
                placeholder="010-0000-0000"
              />
            </div>
            <div className="checkout-form-row">
              <label className="checkout-label">배송 주소</label>
              <div className="checkout-address-row">
                <input
                  type="text"
                  className="checkout-input checkout-input--postcode"
                  placeholder="우편번호"
                  readOnly
                />
                <button type="button" className="checkout-address-search">
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                className="checkout-input"
                placeholder="기본 주소"
                readOnly
              />
              <input
                type="text"
                className="checkout-input"
                placeholder="상세 주소"
              />
            </div>
          </div>
        </section>

        {/* 결제 수단 */}
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

        {/* 결제 금액 요약 */}
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

        {/* 결제하기 버튼 */}
        <div className="checkout-actions">
          <button
            type="button"
            className="checkout-submit-btn"
            disabled={loading || onlineItems.length === 0 || isProcessing}
            onClick={handlePayment}
          >
            {paymentMethod === 'kakao' && '카카오페이로 결제하기'}
            {paymentMethod === 'naver' && '네이버페이로 결제하기'}
            {(paymentMethod === 'card' || paymentMethod === 'transfer') &&
              `${totalAmount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>

      {/* 결제 완료 오버레이 */}
      {isProcessing && (
        <div className="checkout-overlay">
          <div className="checkout-overlay-content">
            <div className="checkout-overlay-icon">
              <i className="ri-checkbox-circle-fill"></i>
            </div>
            <h2 className="checkout-overlay-title">결제가 완료되었습니다</h2>
            <p className="checkout-overlay-message">잠시 후 쇼핑룸으로 이동합니다...</p>
            <div className="checkout-overlay-spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopCheckoutPage;
