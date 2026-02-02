import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomMembers } from '../../../entities/room/api/room';
import type { RoomMember } from '../../../entities/room/types/room.types';
import UserAvatar from '../../../shared/ui/UserAvatar';
import './styles.css';

interface SettlementItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  payerIds?: number[];
  sourceType: 'manual' | 'receipt';
  sourceLabel: string;
}

const MobileSettlementPage: React.FC = () => {
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [items, setItems] = useState<SettlementItem[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');
  const [manualError, setManualError] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [openPayerByItem, setOpenPayerByItem] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [receiptTitle, setReceiptTitle] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const receiptVideoRef = useRef<HTMLVideoElement>(null);
  const receiptCanvasRef = useRef<HTMLCanvasElement>(null);
  const receiptStreamRef = useRef<MediaStream | null>(null);

  const roomId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room_id') ?? sessionStorage.getItem('roomId');
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const loadMembers = async () => {
      try {
        const data = await getRoomMembers(roomId);
        setMembers(data);
      } catch (error) {
        console.error('Failed to load room members:', error);
      }
    };
    void loadMembers();
  }, [roomId]);

  useEffect(() => {
    if (!showReceiptModal) {
      if (receiptStreamRef.current) {
        receiptStreamRef.current.getTracks().forEach((track) => track.stop());
        receiptStreamRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const startCamera = async () => {
      setCameraError('');
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('이 브라우저에서는 카메라를 지원하지 않습니다.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        receiptStreamRef.current = stream;
        if (receiptVideoRef.current) {
          receiptVideoRef.current.srcObject = stream;
          await receiptVideoRef.current.play();
        }
      } catch (error) {
        console.error('Failed to start receipt camera:', error);
        setCameraError('카메라 권한을 허용하거나 장치를 확인해주세요.');
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (receiptStreamRef.current) {
        receiptStreamRef.current.getTracks().forEach((track) => track.stop());
        receiptStreamRef.current = null;
      }
    };
  }, [showReceiptModal]);

  const totalAmount = items.reduce((sum, item) => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 1;
    return sum + price * quantity;
  }, 0);

  const splitByMember = useMemo(() => {
    const acc = new Map<number, number>();
    items.forEach((item) => {
      const quantity = item.quantity ?? 1;
      const price = item.price ?? 0;
      const total = quantity * price;
      const payers = item.payerIds ?? [];
      if (payers.length === 0) return;
      const share = total / payers.length;
      payers.forEach((memberId) => {
        acc.set(memberId, (acc.get(memberId) ?? 0) + share);
      });
    });
    return acc;
  }, [items]);

  const receiptTitles = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .filter((item) => item.sourceType === 'receipt')
            .map((item) => item.sourceLabel)
            .filter((label) => Boolean(label)),
        ),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'manual') return items.filter((item) => item.sourceType === 'manual');
    if (activeFilter.startsWith('receipt:')) {
      const title = activeFilter.replace('receipt:', '');
      return items.filter((item) => item.sourceType === 'receipt' && item.sourceLabel === title);
    }
    return items;
  }, [activeFilter, items]);

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = manualName.trim();
    const quantity = Number(manualQty);
    const price = Number(manualPrice);

    if (!name || Number.isNaN(quantity) || Number.isNaN(price) || quantity <= 0 || price < 0) {
      setManualError('상품명, 개수, 개당 금액을 확인해주세요.');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        name,
        quantity,
        price,
        payerIds: members.map((member) => member.memberId),
        sourceType: 'manual',
        sourceLabel: '수동입력',
      },
    ]);

    setManualName('');
    setManualQty('1');
    setManualPrice('');
    setManualError('');
    setShowManualInput(false);
  };

  const handleCaptureReceipt = () => {
    const title = receiptTitle.trim();
    if (!title) {
      setReceiptError('영수증 제목을 입력해주세요. (예: 주유비)');
      return;
    }

    const video = receiptVideoRef.current;
    const canvas = receiptCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      setReceiptError('카메라 준비가 완료되지 않았습니다.');
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      setReceiptError('카메라 캡처를 처리할 수 없습니다.');
      return;
    }
    context.drawImage(video, 0, 0, width, height);

    setItems((prev) => [
      ...prev,
      {
        id: `receipt-${Date.now()}-${prev.length}`,
        name: `${title} 항목`,
        quantity: 1,
        price: 0,
        payerIds: members.map((member) => member.memberId),
        sourceType: 'receipt',
        sourceLabel: title,
      },
    ]);

    setReceiptTitle('');
    setReceiptError('');
    setShowReceiptModal(false);
    setActiveFilter(`receipt:${title}`);
  };

  const togglePayerPanel = (itemId: string) => {
    setOpenPayerByItem((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleTogglePayer = (itemId: string, memberId: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.payerIds ?? [];
        const hasMember = current.includes(memberId);
        const nextPayerIds = hasMember
          ? current.filter((id) => id !== memberId)
          : [...current, memberId];
        return { ...item, payerIds: nextPayerIds };
      }),
    );
  };

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
            <div className="mobile-settlement-section-head">
              <h2 className="mobile-settlement-section-title">정산할 물품</h2>
              <div className="mobile-settlement-head-actions">
                <div className="mobile-settlement-filter-wrap">
                  <button
                    type="button"
                    className="mobile-settlement-filter-button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                  >
                    {activeFilter === 'all'
                      ? '전체 품목'
                      : activeFilter === 'manual'
                        ? '수동입력'
                        : activeFilter.replace('receipt:', '')}
                    <i className="ri-arrow-down-s-line" />
                  </button>
                  {isFilterOpen && (
                    <div className="mobile-settlement-filter-dropdown">
                      <button
                        type="button"
                        className={`mobile-settlement-filter-option ${activeFilter === 'all' ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveFilter('all');
                          setIsFilterOpen(false);
                        }}
                      >
                        전체 품목
                      </button>
                      <button
                        type="button"
                        className={`mobile-settlement-filter-option ${activeFilter === 'manual' ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveFilter('manual');
                          setIsFilterOpen(false);
                        }}
                      >
                        수동입력
                      </button>
                      {receiptTitles.map((title) => {
                        const key = `receipt:${title}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`mobile-settlement-filter-option ${activeFilter === key ? 'is-active' : ''}`}
                            onClick={() => {
                              setActiveFilter(key);
                              setIsFilterOpen(false);
                            }}
                          >
                            {title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="mobile-settlement-manual-button"
                  onClick={() => setShowManualInput(true)}
                >
                  수동입력
                </button>
              </div>
            </div>
            {filteredItems.length === 0 ? (
              <div className="mobile-settlement-empty">정산할 물품이 없습니다.</div>
            ) : (
              <div className="mobile-settlement-list">
                {filteredItems.map((item) => (
                  <article key={item.id} className="mobile-settlement-card">
                    <div className="mobile-settlement-card-head">
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
                      <div className="mobile-settlement-payer-header">
                        <span>결제 인원</span>
                        <button
                          type="button"
                          className="mobile-settlement-payer-toggle"
                          onClick={() => togglePayerPanel(item.id)}
                        >
                          <i className="ri-user-line" />
                          <span>{(item.payerIds ?? []).length}</span>
                        </button>
                      </div>
                      {openPayerByItem[item.id] && (
                        <div className="mobile-settlement-payer-picker">
                          <div className="mobile-settlement-payer-title">정산 참여자</div>
                          <div className="mobile-settlement-divider" />
                          <div className="mobile-settlement-member-list">
                            {members.length === 0 ? (
                              <div className="mobile-settlement-member-empty">접속 인원 정보가 없습니다.</div>
                            ) : (
                              members.map((member) => {
                                const selected = (item.payerIds ?? []).includes(member.memberId);
                                return (
                                  <button
                                    key={`${item.id}-${member.memberId}`}
                                    type="button"
                                    className={`mobile-settlement-member-avatar-option ${
                                      selected ? 'is-selected' : ''
                                    }`}
                                    onClick={() => handleTogglePayer(item.id, member.memberId)}
                                  >
                                    <UserAvatar
                                      name={member.nickname}
                                      colorKey={member.memberId}
                                      size="md"
                                      className="mobile-settlement-member-avatar"
                                    />
                                    {selected && (
                                      <span className="mobile-settlement-member-check">
                                        <i className="ri-check-line" />
                                      </span>
                                    )}
                                    <span className="mobile-settlement-member-name">{member.nickname}</span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
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
                  {members.length === 0 || splitByMember.size === 0 ? (
                    <div className="mobile-settlement-split-empty">참여자 정산 내역이 없습니다.</div>
                  ) : (
                    members
                      .filter((member) => (splitByMember.get(member.memberId) ?? 0) > 0)
                      .map((member) => (
                        <div key={member.memberId}>
                          <span>{member.nickname}</span>
                          <strong>{Math.round(splitByMember.get(member.memberId) ?? 0).toLocaleString()}원</strong>
                        </div>
                      ))
                  )}
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
            등록 완료
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
                {cameraError ? (
                  <div className="receipt-camera-placeholder">{cameraError}</div>
                ) : (
                  <video
                    ref={receiptVideoRef}
                    className="receipt-camera-video"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                <div className="receipt-frame-guide" />
              </div>
              <p className="receipt-guide-text">영수증을 프레임 안에 맞춰 촬영해주세요.</p>
              <input
                className="mobile-settlement-manual-input"
                type="text"
                placeholder="영수증 제목 (예: 주유비)"
                value={receiptTitle}
                onChange={(event) => {
                  setReceiptTitle(event.target.value);
                  if (receiptError) setReceiptError('');
                }}
              />
              {receiptError && <div className="mobile-settlement-manual-error">{receiptError}</div>}
            </div>

            <div className="receipt-modal-actions">
              <button type="button" className="receipt-action ghost" onClick={() => setShowReceiptModal(false)}>
                취소
              </button>
              <button type="button" className="receipt-action primary" onClick={handleCaptureReceipt}>
                촬영
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={receiptCanvasRef} style={{ display: 'none' }} />

      {showManualInput && (
        <div className="mobile-settlement-manual-modal">
          <div className="mobile-settlement-manual-backdrop" onClick={() => setShowManualInput(false)} />
          <div className="mobile-settlement-manual-card">
            <div className="mobile-settlement-manual-title">수동 입력</div>
            <form className="mobile-settlement-manual-form" onSubmit={handleManualSubmit}>
              <input
                className="mobile-settlement-manual-input"
                type="text"
                placeholder="상품명"
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
              />
              <div className="mobile-settlement-manual-row">
                <input
                  className="mobile-settlement-manual-input"
                  type="number"
                  min={1}
                  placeholder="개수"
                  value={manualQty}
                  onChange={(event) => setManualQty(event.target.value)}
                />
                <input
                  className="mobile-settlement-manual-input"
                  type="number"
                  min={0}
                  placeholder="개당 금액"
                  value={manualPrice}
                  onChange={(event) => setManualPrice(event.target.value)}
                />
              </div>
              {manualError && <div className="mobile-settlement-manual-error">{manualError}</div>}
              <div className="mobile-settlement-manual-actions">
                <button
                  type="button"
                  className="mobile-settlement-manual-cancel"
                  onClick={() => setShowManualInput(false)}
                >
                  취소
                </button>
                <button type="submit" className="mobile-settlement-manual-submit">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSettlementPage;
