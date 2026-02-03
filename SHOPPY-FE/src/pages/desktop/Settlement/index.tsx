import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAvatar from '@/shared/ui/UserAvatar';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import { useSettlementRealtime } from '@/features/settlement/model/useSettlementRealtime';
import './styles.css';

const EMPTY_ITEMS: ReturnType<typeof useSettlementStore.getState>['settlementItemsByRoom'][string] = [];

const DesktopSettlementPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'manual' | string>('all');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');
  const [manualPayerId, setManualPayerId] = useState('');
  const [manualBankName, setManualBankName] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualError, setManualError] = useState('');

  const settlementItemsByRoom = useSettlementStore((state) => state.settlementItemsByRoom);
  const items = roomId ? settlementItemsByRoom[roomId] ?? EMPTY_ITEMS : EMPTY_ITEMS;
  const updateSettlementItemPayers = useSettlementStore((state) => state.updateSettlementItemPayers);
  const appendSettlementItems = useSettlementStore((state) => state.appendSettlementItems);
  useSettlementRealtime({ roomId });

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

  const receiptTitles = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .filter((item) => item.sourceType === 'receipt')
            .map((item) => item.sourceLabel)
            .filter(Boolean),
        ),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'online') return items.filter((item) => item.sourceType === 'online');
    if (activeFilter === 'manual') return items.filter((item) => item.sourceType === 'manual');
    if (activeFilter.startsWith('receipt:')) {
      const title = activeFilter.replace('receipt:', '');
      return items.filter((item) => item.sourceType === 'receipt' && item.sourceLabel === title);
    }
    return items;
  }, [activeFilter, items]);

  const totalAmount = useMemo(
    () =>
      filteredItems.reduce((sum, item) => {
        const price = item.price ?? 0;
        const quantity = item.quantity ?? 1;
        return sum + price * quantity;
      }, 0),
    [filteredItems],
  );

  const togglePayer = (itemId: string, memberId: number) => {
    if (!roomId) return;
    const target = items.find((item) => item.id === itemId);
    if (!target) return;

    const current = target.payerIds ?? [];
    const next = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
    updateSettlementItemPayers(roomId, itemId, next);
  };

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId) {
      setManualError('방 정보가 없어 저장할 수 없습니다.');
      return;
    }

    const name = manualName.trim();
    const quantity = Number(manualQty);
    const price = Number(manualPrice);
    const payerMemberId = Number(manualPayerId);
    const bankName = manualBankName.trim();
    const accountNumber = manualAccountNumber.trim();

    if (!name || Number.isNaN(quantity) || Number.isNaN(price) || quantity <= 0 || price < 0) {
      setManualError('상품명, 개수, 개당 금액을 확인해주세요.');
      return;
    }
    if (!Number.isFinite(payerMemberId) || payerMemberId <= 0) {
      setManualError('결제자를 선택해주세요.');
      return;
    }
    if (!bankName || !accountNumber) {
      setManualError('은행명과 계좌번호를 입력해주세요.');
      return;
    }

    appendSettlementItems(roomId, [
      {
        id: `desktop-manual-${Date.now()}`,
        name,
        quantity,
        price,
        payerIds: members.map((member) => member.memberId),
        payerMemberId,
        payerBankName: bankName,
        payerAccountNumber: accountNumber,
        sourceType: 'manual',
        sourceLabel: '수동입력',
      },
    ]);

    setManualName('');
    setManualQty('1');
    setManualPrice('');
    setManualPayerId('');
    setManualBankName('');
    setManualAccountNumber('');
    setManualError('');
    setShowManualInput(false);
    setActiveFilter('manual');
  };

  return (
    <div className="desktop-settlement-page">
      <div className="desktop-settlement-container">
        <div className="desktop-settlement-header-row">
          <div className="desktop-settlement-title-wrap">
            <button type="button" className="desktop-settlement-back" onClick={() => navigate(`/rooms/${roomId}`)}>
              <i className="ri-arrow-left-line" />
            </button>
            <div>
              <h1>정산하기</h1>
            </div>
          </div>
          <div className="desktop-settlement-head-actions">
            <button type="button" className="desktop-settlement-manual-btn" onClick={() => setShowManualInput(true)}>
              수동입력
            </button>
            <div className="desktop-settlement-filter-wrap">
            <select
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
              className="desktop-settlement-filter"
            >
              <option value="all">전체 품목</option>
              <option value="online">온라인 품목</option>
              <option value="manual">수동입력</option>
              {receiptTitles.map((title) => (
                <option key={title} value={`receipt:${title}`}>
                  {title}
                </option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="desktop-settlement-empty">정산할 물품이 없습니다.</div>
        ) : (
          <div className="desktop-settlement-list">
            {filteredItems.map((item) => (
              <article key={item.id} className="desktop-settlement-card">
                <div className="desktop-settlement-top">
                  <strong>{item.name}</strong>
                  <span className={`desktop-settlement-source source-${item.sourceType}`}>{item.sourceLabel}</span>
                </div>
                <div className="desktop-settlement-meta">
                  <span>가격 {Number(item.price ?? 0).toLocaleString()}원</span>
                  <span>수량 {item.quantity ?? 1}개</span>
                  <span>합계 {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}원</span>
                </div>
                <div className="desktop-settlement-members-title">결제 인원 선택</div>
                <div className="desktop-settlement-members">
                  {members.map((member) => {
                    const selected = (item.payerIds ?? []).includes(member.memberId);
                    return (
                      <button
                        key={`${item.id}-${member.memberId}`}
                        type="button"
                        className={`desktop-settlement-member ${selected ? 'is-selected' : ''}`}
                        onClick={() => togglePayer(item.id, member.memberId)}
                      >
                        <UserAvatar name={member.nickname} colorKey={member.memberId} size="md" />
                        <span>{member.nickname}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="desktop-settlement-summary">
          <div>
            <span>총 금액</span>
            <p>선택된 필터 기준 합계</p>
          </div>
          <strong>{totalAmount.toLocaleString()}원</strong>
        </div>

        <div className="desktop-settlement-bottom-actions">
          <button
            type="button"
            className="desktop-settlement-complete-btn"
            onClick={() => navigate(`/rooms/${roomId}/settlement/result`)}
          >
            등록 완료
          </button>
        </div>
      </div>

      {showManualInput && (
        <div className="desktop-settlement-manual-modal">
          <div className="desktop-settlement-manual-backdrop" onClick={() => setShowManualInput(false)} />
          <div className="desktop-settlement-manual-card">
            <div className="desktop-settlement-manual-title">수동 입력</div>
            <form className="desktop-settlement-manual-form" onSubmit={handleManualSubmit}>
              <input
                className="desktop-settlement-manual-input"
                type="text"
                placeholder="상품명"
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
              />
              <select
                className="desktop-settlement-manual-input"
                value={manualPayerId}
                onChange={(event) => setManualPayerId(event.target.value)}
              >
                <option value="">결제자 선택</option>
                {members.map((member) => (
                  <option key={member.memberId} value={member.memberId}>
                    {member.nickname}
                  </option>
                ))}
              </select>
              <div className="desktop-settlement-manual-row">
                <input
                  className="desktop-settlement-manual-input"
                  type="text"
                  placeholder="은행명"
                  value={manualBankName}
                  onChange={(event) => setManualBankName(event.target.value)}
                />
                <input
                  className="desktop-settlement-manual-input"
                  type="text"
                  placeholder="계좌번호"
                  value={manualAccountNumber}
                  onChange={(event) => setManualAccountNumber(event.target.value)}
                />
              </div>
              <div className="desktop-settlement-manual-row">
                <input
                  className="desktop-settlement-manual-input"
                  type="number"
                  min={1}
                  placeholder="개수"
                  value={manualQty}
                  onChange={(event) => setManualQty(event.target.value)}
                />
                <input
                  className="desktop-settlement-manual-input"
                  type="number"
                  min={0}
                  placeholder="개당 금액"
                  value={manualPrice}
                  onChange={(event) => setManualPrice(event.target.value)}
                />
              </div>
              {manualError && <div className="desktop-settlement-manual-error">{manualError}</div>}
              <div className="desktop-settlement-manual-actions">
                <button type="button" className="desktop-settlement-manual-cancel" onClick={() => setShowManualInput(false)}>
                  취소
                </button>
                <button type="submit" className="desktop-settlement-manual-submit">
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

export default DesktopSettlementPage;
