import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAvatar from '@/shared/ui/UserAvatar';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { getSettlement } from '@/entities/settlement/api/settlementApi';
import { mapSettlementResponseToStoreItems } from '@/entities/settlement/model/mapper';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import { useSettlementRealtime } from '@/features/settlement/model/useSettlementRealtime';
import { useLeaveRoom } from '@/features/room/leave-room';
import './styles.css';

type TransferRow = {
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  bankName?: string;
  accountNumber?: string;
};

const EMPTY_ITEMS: ReturnType<typeof useSettlementStore.getState>['settlementItemsByRoom'][string] = [];

const DesktopSettlementResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRow | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const { leaveByButton } = useLeaveRoom({
    roomId,
    navigateTo: '/',
  });

  const settlementItemsByRoom = useSettlementStore((state) => state.settlementItemsByRoom);
  const settlementIdByRoom = useSettlementStore((state) => state.settlementIdByRoom);
  const setSettlementId = useSettlementStore((state) => state.setSettlementId);
  const setSettlementItems = useSettlementStore((state) => state.setSettlementItems);
  const transferStatusByRoom = useSettlementStore((state) => state.transferStatusByRoom);
  const markTransferDone = useSettlementStore((state) => state.markTransferDone);
  const syncLockRef = useRef(false);

  const getPersistedSettlementId = useCallback(() => {
    if (!roomId) return null;
    const stored = Number(localStorage.getItem(`settlement:id:${roomId}`) ?? '0');
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }, [roomId]);

  const refreshSettlementFromServer = useCallback(
    async (overrideSettlementId?: number) => {
      if (!roomId || syncLockRef.current) return;
      const targetSettlementId =
        overrideSettlementId ?? settlementIdByRoom[roomId] ?? getPersistedSettlementId();
      if (!targetSettlementId) return;

      syncLockRef.current = true;
      try {
        const response = await getSettlement(targetSettlementId);
        setSettlementId(roomId, targetSettlementId);
        localStorage.setItem(`settlement:id:${roomId}`, String(targetSettlementId));
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response));
      } catch (error) {
        console.error('Failed to sync settlement result from realtime event:', error);
      } finally {
        syncLockRef.current = false;
      }
    },
    [getPersistedSettlementId, roomId, setSettlementId, setSettlementItems, settlementIdByRoom],
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
        void refreshSettlementFromServer(payloadSettlementId);
        return;
      }
      void refreshSettlementFromServer();
    },
  });

  const items = roomId ? settlementItemsByRoom[roomId] ?? EMPTY_ITEMS : EMPTY_ITEMS;
  const transferStatus = roomId ? transferStatusByRoom[roomId] ?? {} : {};
  const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');

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
    if (!roomId || items.length > 0) return;
    const settlementId = settlementIdByRoom[roomId] ?? getPersistedSettlementId();
    if (!settlementId) return;

    const loadSettlement = async () => {
      try {
        const response = await getSettlement(settlementId);
        setSettlementId(roomId, settlementId);
        localStorage.setItem(`settlement:id:${roomId}`, String(settlementId));
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response));
      } catch (error) {
        console.error('Failed to load settlement result:', error);
      }
    };

    void loadSettlement();
  }, [getPersistedSettlementId, items.length, roomId, setSettlementId, settlementIdByRoom, setSettlementItems]);

  const transferRows = useMemo(() => {
    const EPSILON = 0.000001;
    const balanceByMember = new Map<number, number>();
    const accountByReceiver = new Map<number, { bankName?: string; accountNumber?: string }>();

    const addBalance = (memberId: number, delta: number) => {
      balanceByMember.set(memberId, (balanceByMember.get(memberId) ?? 0) + delta);
    };

    items.forEach((item) => {
      const payer = Number(item.payerMemberId ?? 0);
      const participants = Array.from(new Set(item.payerIds ?? [])).filter((memberId) => Number.isFinite(memberId) && memberId > 0);
      const total = Number(item.price ?? 0) * Number(item.quantity ?? 1);
      if (!Number.isFinite(payer) || payer <= 0 || participants.length === 0 || total <= 0) return;

      const share = total / participants.length;
      participants.forEach((participantId) => addBalance(participantId, -share));
      addBalance(payer, total);

      if ((item.payerBankName || item.payerAccountNumber) && !accountByReceiver.has(payer)) {
        accountByReceiver.set(payer, {
          bankName: item.payerBankName,
          accountNumber: item.payerAccountNumber,
        });
      }
    });

    const creditors = Array.from(balanceByMember.entries())
      .filter(([, value]) => value > EPSILON)
      .map(([memberId, value]) => ({ memberId, value }));
    const debtors = Array.from(balanceByMember.entries())
      .filter(([, value]) => value < -EPSILON)
      .map(([memberId, value]) => ({ memberId, value: -value }));

    const rows: TransferRow[] = [];
    let creditorIndex = 0;
    let debtorIndex = 0;
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = Math.min(creditor.value, debtor.value);

      if (amount > EPSILON) {
        const receiverAccount = accountByReceiver.get(creditor.memberId);
        rows.push({
          fromMemberId: debtor.memberId,
          toMemberId: creditor.memberId,
          amount,
          bankName: receiverAccount?.bankName,
          accountNumber: receiverAccount?.accountNumber,
        });
      }

      creditor.value -= amount;
      debtor.value -= amount;
      if (creditor.value <= EPSILON) creditorIndex += 1;
      if (debtor.value <= EPSILON) debtorIndex += 1;
    }

    if (Number.isFinite(currentMemberId) && currentMemberId > 0) {
      return rows.filter((row) => row.fromMemberId === currentMemberId);
    }
    return rows;
  }, [currentMemberId, items]);

  const getMemberName = (memberId: number) =>
    members.find((member) => member.memberId === memberId)?.nickname ?? `멤버 ${memberId}`;

  const getTransferDone = (row: TransferRow) => transferStatus[`${row.fromMemberId}->${row.toMemberId}`] ?? false;

  return (
    <div className="desktop-settlement-result-page">
      <div className="desktop-settlement-result-shell">
        <div className="desktop-settlement-result-header">
          <button type="button" className="desktop-settlement-result-back" onClick={() => navigate(`/rooms/${roomId}/settlement`)}>
            <i className="ri-arrow-left-line" />
          </button>
          <h1>정산하기</h1>
          <div className="desktop-settlement-result-spacer" />
        </div>

        <div className="desktop-settlement-result-grid">
          <section className="desktop-settlement-result-section">
            <h2>내가 보낼 금액</h2>
            <div className="desktop-settlement-result-list">
              {transferRows.length === 0 ? (
                <div className="desktop-settlement-result-empty">송금 내역이 없습니다.</div>
              ) : (
                transferRows.map((row) => {
                  const done = getTransferDone(row);
                  return (
                    <div key={`all-${row.fromMemberId}-${row.toMemberId}`} className={`desktop-settlement-transfer-card ${done ? 'is-done' : ''}`}>
                      <div className="desktop-settlement-transfer-left">
                        <UserAvatar name={getMemberName(row.fromMemberId)} colorKey={row.fromMemberId} size="md" />
                        <strong>{getMemberName(row.fromMemberId)}</strong>
                      </div>
                      <div className="desktop-settlement-transfer-right">
                        <span>{Math.round(row.amount).toLocaleString()}원</span>
                        {done ? <em>완료</em> : <button type="button" onClick={() => setSelectedTransfer(row)}>송금</button>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
        <div className="desktop-settlement-result-bottom-actions">
          <button
            type="button"
            className="desktop-settlement-result-finish"
            onClick={() => setShowFinishConfirm(true)}
          >
            정산 완료
          </button>
        </div>
      </div>

      {selectedTransfer && (
        <div className="desktop-settlement-transfer-modal">
          <div className="desktop-settlement-transfer-backdrop" onClick={() => setSelectedTransfer(null)} />
          <div className="desktop-settlement-transfer-sheet">
            <h3>송금 정보</h3>
            <p>수신자: {getMemberName(selectedTransfer.toMemberId)}</p>
            <p>은행: {selectedTransfer.bankName || '-'}</p>
            <p>계좌: {selectedTransfer.accountNumber || '-'}</p>
            <p>금액: {Math.round(selectedTransfer.amount).toLocaleString()}원</p>

            <div className="desktop-settlement-transfer-actions">
              <button type="button" className="ghost" onClick={() => setSelectedTransfer(null)}>닫기</button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (!roomId) return;
                  markTransferDone(roomId, selectedTransfer.fromMemberId, selectedTransfer.toMemberId, true);
                  setSelectedTransfer(null);
                }}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishConfirm && (
        <div className="desktop-settlement-transfer-modal">
          <div className="desktop-settlement-transfer-backdrop" onClick={() => setShowFinishConfirm(false)} />
          <div className="desktop-settlement-transfer-sheet">
            <h3>정산 완료</h3>
            <p>
              완료 후 공유 채팅방이 종료됩니다.
              <br />
              종료하시겠습니까?
            </p>

            <div className="desktop-settlement-transfer-actions">
              <button type="button" className="ghost" onClick={() => setShowFinishConfirm(false)}>
                아니요
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setShowFinishConfirm(false);
                  leaveByButton();
                }}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopSettlementResultPage;
