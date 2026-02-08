import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAvatar from '@/shared/ui/UserAvatar';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import {
  createSettlement,
  getSettlement,
  updateSettlementDraft,
  updateSettlementItemSplits,
} from '@/entities/settlement/api/settlementApi';
import {
  mapSettlementDraftResponseToStoreItems,
  mapSettlementResponseToStoreItems,
} from '@/entities/settlement/model/mapper';
import type { SettlementItem } from '@/entities/settlement/model/useSettlementStore';
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
  const [openPayerByItem, setOpenPayerByItem] = useState<Record<string, boolean>>({});

  const settlementItemsByRoom = useSettlementStore((state) => state.settlementItemsByRoom);
  const settlementIdByRoom = useSettlementStore((state) => state.settlementIdByRoom);
  const items = roomId ? settlementItemsByRoom[roomId] ?? EMPTY_ITEMS : EMPTY_ITEMS;
  const setSettlementItems = useSettlementStore((state) => state.setSettlementItems);
  const setSettlementId = useSettlementStore((state) => state.setSettlementId);
  const updateSettlementItemPayers = useSettlementStore((state) => state.updateSettlementItemPayers);
  const appendSettlementItems = useSettlementStore((state) => state.appendSettlementItems);
  const settlementStorageKey = useMemo(
    () => (roomId ? `settlement:id:${roomId}` : ''),
    [roomId],
  );
  const getPersistedSettlementId = useCallback(() => {
    if (!settlementStorageKey) return null;
    const stored = Number(localStorage.getItem(settlementStorageKey) ?? '0');
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }, [settlementStorageKey]);
  const persistSettlementId = useCallback(
    (id: number) => {
      if (!settlementStorageKey || !Number.isFinite(id) || id <= 0) return;
      localStorage.setItem(settlementStorageKey, String(id));
    },
    [settlementStorageKey],
  );

  const ensureSettlementId = useCallback(
    async (nextItems: SettlementItem[]) => {
      if (!roomId) return null;

      const existingSettlementId = settlementIdByRoom[roomId] ?? getPersistedSettlementId();
      if (existingSettlementId) return existingSettlementId;
      if (nextItems.length === 0) return null;

      const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');
      if (!Number.isFinite(currentMemberId) || currentMemberId <= 0) return null;

      try {
        const created = await createSettlement(roomId, {
          payerMemberId: currentMemberId,
          totalAmount: nextItems.reduce(
            (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
            0,
          ),
          items: nextItems.map((item) => ({
            itemName: item.name,
            unitPrice: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            payerMemberId: Number(item.payerMemberId ?? currentMemberId),
            payerBankName: item.payerBankName ?? '',
            payerAccountNumber: item.payerAccountNumber ?? '',
            sourceType: item.sourceType,
            sourceLabel: item.sourceLabel,
            receiptTitle: item.receiptTitle,
          })),
        });

        setSettlementId(roomId, created.purchaseId);
        persistSettlementId(created.purchaseId);
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(created, nextItems));
        return created.purchaseId;
      } catch (error) {
        console.error('Failed to ensure settlement id:', error);
        return null;
      }
    },
    [getPersistedSettlementId, persistSettlementId, roomId, settlementIdByRoom, setSettlementId, setSettlementItems],
  );

  const syncSettlementDraft = useCallback(
    async (nextItems: SettlementItem[]) => {
      if (!roomId) return;
      const settlementId =
        (await ensureSettlementId(nextItems)) ?? settlementIdByRoom[roomId] ?? getPersistedSettlementId();
      if (!settlementId) return;

      const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');
      const memberIds = members.map((member) => member.memberId);
      const participantIds = Number.isFinite(currentMemberId) && currentMemberId > 0
        ? Array.from(new Set([...memberIds, currentMemberId]))
        : memberIds;

      try {
        const response = await updateSettlementDraft(settlementId, {
          payerMemberId: currentMemberId > 0 ? currentMemberId : undefined,
          participantIds,
          items: nextItems.map((item) => {
            const purchaseItemId = Number(item.id);
            const itemPayerId = Number(item.payerMemberId ?? currentMemberId);
            const itemParticipantIdsSource = item.payerIds ?? participantIds;
            const itemParticipantIds = Number.isFinite(itemPayerId) && itemPayerId > 0
              ? Array.from(new Set([...itemParticipantIdsSource, itemPayerId]))
              : itemParticipantIdsSource;
            return {
              purchaseItemId: Number.isFinite(purchaseItemId) && purchaseItemId > 0 ? purchaseItemId : undefined,
              itemName: item.name,
              unitPrice: Number(item.price ?? 0),
              quantity: Number(item.quantity ?? 1),
              payerMemberId: Number.isFinite(itemPayerId) && itemPayerId > 0 ? itemPayerId : undefined,
              payerBankName: item.payerBankName ?? '',
              payerAccountNumber: item.payerAccountNumber ?? '',
              participantIds: itemParticipantIds,
              sourceType: item.sourceType,
              sourceLabel: item.sourceLabel,
              receiptTitle: item.receiptTitle,
            };
          }),
        });

        setSettlementId(roomId, response.settlementId);
        persistSettlementId(response.settlementId);
        setSettlementItems(roomId, mapSettlementDraftResponseToStoreItems(response, nextItems));
      } catch (error) {
        console.error('Failed to update settlement draft:', error);
      }
    },
    [
      ensureSettlementId,
      getPersistedSettlementId,
      members,
      persistSettlementId,
      roomId,
      settlementIdByRoom,
      setSettlementId,
      setSettlementItems,
    ],
  );

  const settlementSyncLockRef = useRef(false);
  const refreshSettlementFromServer = useCallback(
    async (overrideSettlementId?: number) => {
      if (!roomId || settlementSyncLockRef.current) return;
      const targetSettlementId =
        overrideSettlementId ?? settlementIdByRoom[roomId] ?? getPersistedSettlementId();
      if (!targetSettlementId) return;

      settlementSyncLockRef.current = true;
      try {
        const response = await getSettlement(targetSettlementId);
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response, items));
      } catch (error) {
        console.error('Failed to sync settlement from realtime event:', error);
      } finally {
        settlementSyncLockRef.current = false;
      }
    },
    [getPersistedSettlementId, items, roomId, settlementIdByRoom, setSettlementItems],
  );

  useSettlementRealtime({
    roomId,
    onEvent: (event) => {
      if (!roomId) return;

      const payload = (event.payload as Record<string, unknown> | undefined) ?? {};
      const payloadSettlementId = Number(
        payload.settlementId ??
          payload.settlement_id ??
          payload.purchaseId ??
          payload.purchase_id ??
          event.settlementId ??
          event.settlement_id ??
          event.purchaseId ??
          event.purchase_id,
      );

      if (Number.isFinite(payloadSettlementId) && payloadSettlementId > 0) {
        setSettlementId(roomId, payloadSettlementId);
        persistSettlementId(payloadSettlementId);
        void refreshSettlementFromServer(payloadSettlementId);
        return;
      }

      void refreshSettlementFromServer();
    },
  });

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
    if (!roomId) return;
    const persisted = getPersistedSettlementId();
    if (persisted && settlementIdByRoom[roomId] !== persisted) {
      setSettlementId(roomId, persisted);
    }
  }, [getPersistedSettlementId, roomId, settlementIdByRoom, setSettlementId]);

  useEffect(() => {
    if (!roomId || items.length > 0) return;
    const settlementId = settlementIdByRoom[roomId] ?? getPersistedSettlementId();
    if (!settlementId) return;

    const loadSettlement = async () => {
      try {
        const response = await getSettlement(settlementId);
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response));
      } catch (error) {
        console.error('Failed to load settlement:', error);
      }
    };

    void loadSettlement();
  }, [getPersistedSettlementId, items.length, roomId, settlementIdByRoom, setSettlementItems]);

  const handleFinalize = async () => {
    if (!roomId) return;
    const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');
    if (currentMemberId <= 0 || items.length === 0) {
      navigate(`/rooms/${roomId}/settlement/result`);
      return;
    }

    try {
      const payload = {
        payerMemberId: currentMemberId,
        totalAmount: items.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0),
        items: items.map((item) => ({
          itemName: item.name,
          unitPrice: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 1),
          payerMemberId: Number(item.payerMemberId ?? currentMemberId),
          payerBankName: item.payerBankName ?? '',
          payerAccountNumber: item.payerAccountNumber ?? '',
        })),
      };

      const created = await createSettlement(roomId, payload);
      setSettlementId(roomId, created.purchaseId);
      persistSettlementId(created.purchaseId);
      setSettlementItems(roomId, mapSettlementResponseToStoreItems(created, items));

      await Promise.all(
        created.items.map((serverItem, index) =>
          updateSettlementItemSplits(
            serverItem.purchaseItemId,
            items[index]?.payerIds?.length
              ? (items[index].payerIds as number[])
              : serverItem.allocations.map((allocation) => allocation.memberId),
          ),
        ),
      );

      const refreshed = await getSettlement(created.purchaseId);
      setSettlementItems(roomId, mapSettlementResponseToStoreItems(refreshed, items));
    } catch (error) {
      console.error('Failed to create settlement:', error);
    }

    navigate(`/rooms/${roomId}/settlement/result`);
  };

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

  const togglePayer = (itemId: string, memberId: number) => {
    if (!roomId) return;
    const target = items.find((item) => item.id === itemId);
    if (!target) return;

    const current = target.payerIds ?? [];
    const next = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
    updateSettlementItemPayers(roomId, itemId, next);
    const nextItems = items.map((item) => (item.id === itemId ? { ...item, payerIds: next } : item));
    void syncSettlementDraft(nextItems);
  };

  const togglePayerPanel = (itemId: string) => {
    setOpenPayerByItem((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
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

    const newItem: SettlementItem = {
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
    };
    const nextItems = [...items, newItem];
    appendSettlementItems(roomId, [newItem]);
    void syncSettlementDraft(nextItems);

    setManualName('');
    setManualQty('1');
    setManualPrice('');
    setManualPayerId('');
    setManualBankName('');
    setManualAccountNumber('');
    setManualError('');
    setShowManualInput(false);
    setActiveFilter('all');
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
                <div className="desktop-settlement-inputs">
                  <label className="desktop-settlement-field">
                    <span>가격</span>
                    <input type="number" value={Number(item.price ?? 0)} readOnly />
                  </label>
                  <label className="desktop-settlement-field">
                    <span>수량</span>
                    <input type="number" value={item.quantity ?? 1} readOnly />
                  </label>
                </div>
                {!!item.payerMemberId && (
                  <div className="desktop-settlement-receiver-info">
                    결제자: {members.find((m) => m.memberId === item.payerMemberId)?.nickname ?? item.payerMemberId} / {item.payerBankName} {item.payerAccountNumber}
                  </div>
                )}
                <div className="desktop-settlement-members-header">
                  <div className="desktop-settlement-members-title">정산 참여자</div>
                  <button
                    type="button"
                    className="desktop-settlement-members-toggle"
                    onClick={() => togglePayerPanel(item.id)}
                  >
                    <i className="ri-user-line" />
                    <span>{(item.payerIds ?? []).length}</span>
                  </button>
                </div>
                {openPayerByItem[item.id] && (
                  <div className="desktop-settlement-members-panel">
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
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="desktop-settlement-summary">
          <div className="desktop-settlement-summary-top">
            <div>
              <span>총 금액</span>
            </div>
            <strong className="desktop-settlement-total">{totalAmount.toLocaleString()}원</strong>
          </div>
          <div className="desktop-settlement-summary-divider" />
          <div className="desktop-settlement-summary-bottom">
            <div className="desktop-settlement-split-title">각자 결제 금액</div>
            <div className="desktop-settlement-split-list">
              {members.length === 0 || splitByMember.size === 0 ? (
                <div className="desktop-settlement-split-empty">참여자 정산 내역이 없습니다.</div>
              ) : (
                members
                  .filter((member) => (splitByMember.get(member.memberId) ?? 0) > 0)
                  .map((member) => (
                    <div key={member.memberId} className="desktop-settlement-split-row">
                      <span className="desktop-settlement-split-name">{member.nickname}</span>
                      <strong>{Math.round(splitByMember.get(member.memberId) ?? 0).toLocaleString()}원</strong>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="desktop-settlement-bottom-actions">
          <button
            type="button"
            className="desktop-settlement-complete-btn"
            onClick={handleFinalize}
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
