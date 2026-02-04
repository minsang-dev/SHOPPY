import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAvatar from '@/shared/ui/UserAvatar';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { getSettlement } from '@/entities/settlement/api/settlementApi';
import { mapSettlementResponseToStoreItems } from '@/entities/settlement/model/mapper';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import './styles.css';

type TransferRow = {
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  bankName?: string;
  accountNumber?: string;
};

const EMPTY_ITEMS: ReturnType<typeof useSettlementStore.getState>['settlementItemsByRoom'][string] = [];

interface MobileSettlementResultPageProps {
  embedded?: boolean;
}

const MobileSettlementResultPage: React.FC<MobileSettlementResultPageProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const routeParams = useParams<{ roomId?: string }>();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRow | null>(null);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const roomId = routeParams.roomId ?? params.get('room_id') ?? sessionStorage.getItem('roomId') ?? '';
  const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');

  const settlementItemsByRoom = useSettlementStore((state) => state.settlementItemsByRoom);
  const settlementIdByRoom = useSettlementStore((state) => state.settlementIdByRoom);
  const setSettlementItems = useSettlementStore((state) => state.setSettlementItems);
  const transferStatusByRoom = useSettlementStore((state) => state.transferStatusByRoom);
  const markTransferDone = useSettlementStore((state) => state.markTransferDone);

  const items = roomId ? settlementItemsByRoom[roomId] ?? EMPTY_ITEMS : EMPTY_ITEMS;
  const transferStatus = roomId ? transferStatusByRoom[roomId] ?? {} : {};

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
    const settlementId = settlementIdByRoom[roomId];
    if (!settlementId) return;

    const loadSettlement = async () => {
      try {
        const response = await getSettlement(settlementId);
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response));
      } catch (error) {
        console.error('Failed to load settlement result:', error);
      }
    };

    void loadSettlement();
  }, [items.length, roomId, settlementIdByRoom, setSettlementItems]);

  const transferRows = useMemo(() => {
    const map = new Map<string, TransferRow>();

    items.forEach((item) => {
      const payer = item.payerMemberId;
      const participants = item.payerIds ?? [];
      const total = (item.price ?? 0) * (item.quantity ?? 1);
      if (!payer || participants.length === 0 || total <= 0) return;

      const share = total / participants.length;
      participants.forEach((participantId) => {
        if (participantId === payer) return;
        const key = `${participantId}->${payer}`;
        const current = map.get(key);
        if (!current) {
          map.set(key, {
            fromMemberId: participantId,
            toMemberId: payer,
            amount: share,
            bankName: item.payerBankName,
            accountNumber: item.payerAccountNumber,
          });
          return;
        }

        current.amount += share;
        if (!current.bankName && item.payerBankName) current.bankName = item.payerBankName;
        if (!current.accountNumber && item.payerAccountNumber) current.accountNumber = item.payerAccountNumber;
      });
    });

    return Array.from(map.values());
  }, [items]);

  const myTransfers = transferRows.filter(
    (row) => row.fromMemberId === currentMemberId && row.toMemberId !== currentMemberId,
  );

  const getMemberName = (memberId: number) =>
    members.find((member) => member.memberId === memberId)?.nickname ?? `멤버 ${memberId}`;

  const getTransferDone = (row: TransferRow) => transferStatus[`${row.fromMemberId}->${row.toMemberId}`] ?? false;

  return (
    <div className={`mobile-settlement-result-page ${embedded ? 'is-embedded' : ''}`}>
      <div className={`mobile-settlement-result-shell ${embedded ? 'is-embedded' : ''}`}>
        {!embedded && (
          <div className="mobile-settlement-result-header">
            <button
              type="button"
              className="mobile-settlement-result-back"
              onClick={() => (roomId ? navigate(`/m/room/${encodeURIComponent(roomId)}/settlement`) : navigate(-1))}
            >
              <i className="ri-arrow-left-line" />
            </button>
            <h1>정산하기</h1>
            <div className="mobile-settlement-result-spacer" />
          </div>
        )}

        <section className="mobile-settlement-result-section">
          <h2>내가 보낼 금액</h2>
          <div className="mobile-settlement-result-list">
            {myTransfers.length === 0 ? (
              <div className="mobile-settlement-result-empty">보낼 송금 내역이 없습니다.</div>
            ) : (
              myTransfers.map((row) => {
                const done = getTransferDone(row);
                return (
                  <div key={`my-${row.fromMemberId}-${row.toMemberId}`} className={`mobile-settlement-transfer-card ${done ? 'is-done' : ''}`}>
                    <div className="mobile-settlement-transfer-left">
                      <UserAvatar name={getMemberName(row.toMemberId)} colorKey={row.toMemberId} size="md" />
                      <strong>{getMemberName(row.toMemberId)}</strong>
                    </div>
                    <div className="mobile-settlement-transfer-right">
                      <span>{Math.round(row.amount).toLocaleString()}원</span>
                      <button type="button" onClick={() => setSelectedTransfer(row)}>송금</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mobile-settlement-result-section">
          <h2>전체 송금 내역</h2>
          <div className="mobile-settlement-result-list">
            {transferRows.length === 0 ? (
              <div className="mobile-settlement-result-empty">송금 내역이 없습니다.</div>
            ) : (
              transferRows.map((row) => {
                const done = getTransferDone(row);
                return (
                  <div key={`all-${row.fromMemberId}-${row.toMemberId}`} className={`mobile-settlement-transfer-card ${done ? 'is-done' : ''}`}>
                    <div className="mobile-settlement-transfer-left">
                      <UserAvatar name={getMemberName(row.fromMemberId)} colorKey={row.fromMemberId} size="md" />
                      <strong>{getMemberName(row.fromMemberId)}</strong>
                    </div>
                    <div className="mobile-settlement-transfer-right">
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

      {selectedTransfer && (
        <div className="mobile-settlement-transfer-modal">
          <div className="mobile-settlement-transfer-backdrop" onClick={() => setSelectedTransfer(null)} />
          <div className="mobile-settlement-transfer-sheet">
            <h3>송금 정보</h3>
            <p>수신자: {getMemberName(selectedTransfer.toMemberId)}</p>
            <p>은행: {selectedTransfer.bankName || '-'}</p>
            <p>계좌: {selectedTransfer.accountNumber || '-'}</p>
            <p>금액: {Math.round(selectedTransfer.amount).toLocaleString()}원</p>

            <div className="mobile-settlement-transfer-actions">
              <button type="button" className="ghost" onClick={() => setSelectedTransfer(null)}>닫기</button>
              <button
                type="button"
                className="primary"
                onClick={() => {
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
    </div>
  );
};

export default MobileSettlementResultPage;
