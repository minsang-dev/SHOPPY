import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomMembers } from '../../../entities/room/api/room';
import type { RoomMember } from '../../../entities/room/types/room.types';
import UserAvatar from '../../../shared/ui/UserAvatar';
import { useSettlementStore } from '@/entities/settlement/model/useSettlementStore';
import {
  createSettlement,
  getSettlement,
  updateSettlementDraft,
  updateSettlementItemSplits,
  uploadReceiptImage,
} from '@/entities/settlement/api/settlementApi';
import {
  mapSettlementDraftResponseToStoreItems,
  mapSettlementResponseToStoreItems,
} from '@/entities/settlement/model/mapper';
import { getShoppingList } from '@/entities/shopping/api/shopping';
import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';
import type { SettlementItem } from '@/entities/settlement/model/useSettlementStore';
import { useSettlementRealtime } from '@/features/settlement/model/useSettlementRealtime';
import './styles.css';

const EMPTY_ITEMS: ReturnType<typeof useSettlementStore.getState>['settlementItemsByRoom'][string] = [];

interface MobileSettlementPageProps {
  embedded?: boolean;
}

const MobileSettlementPage: React.FC<MobileSettlementPageProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const routeParams = useParams<{ roomId?: string }>();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');
  const [manualPayerId, setManualPayerId] = useState('');
  const [manualBankName, setManualBankName] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualError, setManualError] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [openPayerByItem, setOpenPayerByItem] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const onlineFallbackRef = useRef<{ key: string; items: Array<SettlementItem | undefined> } | null>(null);
  const onlineFallbackLoadingRef = useRef<{ key: string; promise: Promise<Array<SettlementItem | undefined>> } | null>(
    null,
  );

  const [receiptTitle, setReceiptTitle] = useState('');
  const [receiptPayerId, setReceiptPayerId] = useState('');
  const [receiptBankName, setReceiptBankName] = useState('');
  const [receiptAccountNumber, setReceiptAccountNumber] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [cameraError, setCameraError] = useState('');

  const receiptVideoRef = useRef<HTMLVideoElement>(null);
  const receiptCanvasRef = useRef<HTMLCanvasElement>(null);
  const receiptStreamRef = useRef<MediaStream | null>(null);

  const roomId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return routeParams.roomId ?? params.get('room_id') ?? sessionStorage.getItem('roomId') ?? '';
  }, [routeParams.roomId]);

  const settlementItemsByRoom = useSettlementStore((state) => state.settlementItemsByRoom);
  const settlementIdByRoom = useSettlementStore((state) => state.settlementIdByRoom);
  const items = roomId ? settlementItemsByRoom[roomId] ?? EMPTY_ITEMS : EMPTY_ITEMS;
  const appendSettlementItems = useSettlementStore((state) => state.appendSettlementItems);
  const setSettlementItems = useSettlementStore((state) => state.setSettlementItems);
  const setSettlementId = useSettlementStore((state) => state.setSettlementId);
  const updateSettlementItemPayers = useSettlementStore((state) => state.updateSettlementItemPayers);
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

  const buildOnlineFallback = useCallback(
    async (responseItems: Array<{ itemName: string; quantity: number; unitPrice: number }>) => {
      if (!roomId || responseItems.length === 0) return [];

      const normalizeName = (value: string) => value.replace(/\s+/g, '').toLowerCase();
      const resolveShoppingName = (item: ShoppingItem) => item.displayName ?? '';
      const toNumber = (value: unknown) => Number(value ?? 0);
      const key = responseItems
        .map((item) => `${roomId}:${normalizeName(item.itemName)}:${item.quantity}:${item.unitPrice}`)
        .join('|');

      if (onlineFallbackRef.current?.key === key) {
        return onlineFallbackRef.current.items;
      }
      if (onlineFallbackLoadingRef.current?.key === key) {
        return onlineFallbackLoadingRef.current.promise;
      }

      onlineFallbackLoadingRef.current = {
        key,
        promise: (async () => {
          try {
            const { items: shoppingItems } = await getShoppingList(roomId);
            const onlineItems = shoppingItems.filter((item) => {
              const purchaseType =
                typeof item.purchaseType === 'string' ? item.purchaseType.toLowerCase() : item.purchaseType;
              if (purchaseType === 'online') return true;
              if (purchaseType == null && item.productId != null) return true;
              return false;
            });

            if (onlineItems.length === 0) return [];

            let hasMatch = false;
            const mapped = responseItems.map((responseItem) => {
              const responseName = normalizeName(responseItem.itemName);
              const responseQuantity = toNumber(responseItem.quantity);
              const matched = onlineItems.find((candidate) => {
                const candidateName = normalizeName(resolveShoppingName(candidate));
                if (!candidateName || !responseName) return false;
                const candidateQuantity = toNumber(candidate.quantity);
                const nameMatches =
                  candidateName === responseName ||
                  candidateName.includes(responseName) ||
                  responseName.includes(candidateName);
                if (!nameMatches) return false;
                if (candidateQuantity <= 0 || responseQuantity <= 0) return true;
                return candidateQuantity === responseQuantity;
              });

              if (!matched) return undefined;
              hasMatch = true;
              return {
                id: `online-${roomId}-${matched.shoppingItemId}`,
                name: responseItem.itemName,
                quantity: responseItem.quantity,
                price: Number(responseItem.unitPrice),
                sourceType: 'online',
                sourceLabel: '온라인 품목',
              } as SettlementItem;
            });

            return hasMatch ? mapped : [];
          } catch (error) {
            console.warn('Failed to build online fallback:', error);
            return [];
          }
        })(),
      };

      const resolved = await onlineFallbackLoadingRef.current.promise;
      onlineFallbackLoadingRef.current = null;
      onlineFallbackRef.current = resolved.length > 0 ? { key, items: resolved } : null;
      return resolved;
    },
    [roomId],
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
        const onlineFallback = await buildOnlineFallback(response.items);
        const fallbackItems =
          onlineFallback.length > 0
            ? response.items.map((_, index) => onlineFallback[index] ?? items[index])
            : items;
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response, fallbackItems));
      } catch (error) {
        console.error('Failed to sync settlement from realtime event:', error);
      } finally {
        settlementSyncLockRef.current = false;
      }
    },
    [buildOnlineFallback, getPersistedSettlementId, items, roomId, settlementIdByRoom, setSettlementItems],
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

  const ensureReceiptVideoReady = async () => {
    const video = receiptVideoRef.current;
    if (!video) return false;
    if (video.readyState >= 2 && video.videoWidth > 0) return true;

    try {
      await video.play();
    } catch (error) {
      console.warn('Receipt camera play blocked:', error);
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return video.readyState >= 2 && video.videoWidth > 0;
  };

  const toCapturedFile = () => {
    const video = receiptVideoRef.current;
    const canvas = receiptCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      return null;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
      return null;
    }

    const bytes = atob(base64);
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 1) {
      array[i] = bytes.charCodeAt(i);
    }

    return new File([array], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
  };

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
        const onlineFallback = await buildOnlineFallback(response.items);
        const fallbackItems =
          onlineFallback.length > 0 ? response.items.map((_, index) => onlineFallback[index]) : [];
        setSettlementItems(roomId, mapSettlementResponseToStoreItems(response, fallbackItems));
      } catch (error) {
        console.error('Failed to load settlement:', error);
      }
    };

    void loadSettlement();
  }, [buildOnlineFallback, getPersistedSettlementId, items.length, roomId, settlementIdByRoom, setSettlementItems]);

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
    if (activeFilter === 'online') return items.filter((item) => item.sourceType === 'online');
    if (activeFilter.startsWith('receipt:')) {
      const title = activeFilter.replace('receipt:', '');
      return items.filter((item) => item.sourceType === 'receipt' && item.sourceLabel === title);
    }
    return items;
  }, [activeFilter, items]);

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId) {
      setManualError('방 정보가 없어 수동입력을 저장할 수 없습니다.');
      return;
    }

    const name = manualName.trim();
    const quantity = Number(manualQty);
    const price = Number(manualPrice);
    const payerMemberId = Number(manualPayerId);

    if (!name || Number.isNaN(quantity) || Number.isNaN(price) || quantity <= 0 || price < 0) {
      setManualError('상품명, 개수, 개당 금액을 확인해주세요.');
      return;
    }
    if (Number.isNaN(payerMemberId) || payerMemberId <= 0) {
      setManualError('결제자를 선택해주세요.');
      return;
    }

    const newItem: SettlementItem = {
      id: `manual-${Date.now()}`,
      name,
      quantity,
      price,
      payerIds: members.map((member) => member.memberId),
      payerMemberId,
      payerBankName: manualBankName.trim(),
      payerAccountNumber: manualAccountNumber.trim(),
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
  };

  const handleCaptureReceipt = async () => {
    if (!roomId) {
      setReceiptError('방 정보가 없어 영수증 항목을 저장할 수 없습니다.');
      return;
    }

    const title = receiptTitle.trim();
    const payerMemberId = Number(receiptPayerId);
    const bankName = receiptBankName.trim();
    const accountNumber = receiptAccountNumber.trim();

    if (!title) {
      setReceiptError('영수증 제목을 입력해주세요.');
      return;
    }
    if (Number.isNaN(payerMemberId) || payerMemberId <= 0) {
      setReceiptError('결제자를 선택해주세요.');
      return;
    }
    if (!bankName || !accountNumber) {
      setReceiptError('은행명과 계좌번호를 입력해주세요.');
      return;
    }

    const isCameraReady = await ensureReceiptVideoReady();
    if (!isCameraReady) {
      setReceiptError('카메라 준비가 완료되지 않았습니다.');
      return;
    }

    const capturedFile = toCapturedFile();
    if (!capturedFile) {
      setReceiptError('카메라 준비가 완료되지 않았습니다.');
      return;
    }

    try {
      const uploaded = await uploadReceiptImage(roomId, capturedFile);
      if (uploaded.settlement_id) {
        setSettlementId(roomId, uploaded.settlement_id);
        persistSettlementId(uploaded.settlement_id);
      }

      const parsedItems = uploaded.items ?? [];
      if (parsedItems.length > 0) {
        const newItems: SettlementItem[] = parsedItems.map((parsed, index) => ({
          id: `receipt-${Date.now()}-${index}`,
          name: parsed.item_name,
          quantity: parsed.quantity,
          price: Number(parsed.unit_price),
          payerIds: members.map((member) => member.memberId),
          payerMemberId,
          payerBankName: bankName,
          payerAccountNumber: accountNumber,
          receiptTitle: title,
          sourceType: 'receipt',
          sourceLabel: title,
        }));
        const nextItems = [...items, ...newItems];
        appendSettlementItems(roomId, newItems);
        void syncSettlementDraft(nextItems);
      } else {
        const newItem: SettlementItem = {
          id: `receipt-${Date.now()}`,
          name: `${title} 항목`,
          quantity: 1,
          price: 0,
          payerIds: members.map((member) => member.memberId),
          payerMemberId,
          payerBankName: bankName,
          payerAccountNumber: accountNumber,
          receiptTitle: title,
          sourceType: 'receipt',
          sourceLabel: title,
        };
        const nextItems = [...items, newItem];
        appendSettlementItems(roomId, [newItem]);
        void syncSettlementDraft(nextItems);
      }
    } catch (error) {
      // API 실패 시 임시 fallback
      const newItem: SettlementItem = {
        id: `receipt-${Date.now()}`,
        name: `${title} 항목`,
        quantity: 1,
        price: 0,
        payerIds: members.map((member) => member.memberId),
        payerMemberId,
        payerBankName: bankName,
        payerAccountNumber: accountNumber,
        receiptTitle: title,
        sourceType: 'receipt',
        sourceLabel: title,
      };
      const nextItems = [...items, newItem];
      appendSettlementItems(roomId, [newItem]);
      void syncSettlementDraft(nextItems);
      console.warn('Receipt upload failed. Fallback item created.', error);
    }

    setReceiptTitle('');
    setReceiptPayerId('');
    setReceiptBankName('');
    setReceiptAccountNumber('');
    setReceiptError('');
    setShowReceiptModal(false);
    setActiveFilter(`receipt:${title}`);
  };

  const togglePayerPanel = (itemId: string) => {
    setOpenPayerByItem((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleTogglePayer = (itemId: string, memberId: number) => {
    const target = items.find((item) => item.id === itemId);
    if (!target) return;

    const current = target.payerIds ?? [];
    const hasMember = current.includes(memberId);
    const nextPayerIds = hasMember ? current.filter((id) => id !== memberId) : [...current, memberId];
    updateSettlementItemPayers(roomId, itemId, nextPayerIds);
    const nextItems = items.map((item) => (item.id === itemId ? { ...item, payerIds: nextPayerIds } : item));
    void syncSettlementDraft(nextItems);
  };

  return (
    <div className={`mobile-settlement-page ${embedded ? 'is-embedded' : ''}`}>
      <div className={`mobile-settlement-shell ${embedded ? 'is-embedded' : ''}`}>
        {!embedded && (
          <div className="mobile-settlement-header">
            <button type="button" className="mobile-settlement-back" onClick={() => navigate(-1)}>
              <i className="ri-arrow-left-line" />
            </button>
            <h1 className="mobile-settlement-title">정산하기</h1>
            <div className="mobile-settlement-spacer" />
          </div>
        )}

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
                        : activeFilter === 'online'
                          ? '온라인 품목'
                          : activeFilter.replace('receipt:', '')}
                    <i className="ri-arrow-down-s-line" />
                  </button>
                  {isFilterOpen && (
                    <div className="mobile-settlement-filter-dropdown">
                      <button type="button" className={`mobile-settlement-filter-option ${activeFilter === 'all' ? 'is-active' : ''}`} onClick={() => { setActiveFilter('all'); setIsFilterOpen(false); }}>전체 품목</button>
                      <button type="button" className={`mobile-settlement-filter-option ${activeFilter === 'online' ? 'is-active' : ''}`} onClick={() => { setActiveFilter('online'); setIsFilterOpen(false); }}>온라인 품목</button>
                      <button type="button" className={`mobile-settlement-filter-option ${activeFilter === 'manual' ? 'is-active' : ''}`} onClick={() => { setActiveFilter('manual'); setIsFilterOpen(false); }}>수동입력</button>
                      {receiptTitles.map((title) => {
                        const key = `receipt:${title}`;
                        return (
                          <button key={key} type="button" className={`mobile-settlement-filter-option ${activeFilter === key ? 'is-active' : ''}`} onClick={() => { setActiveFilter(key); setIsFilterOpen(false); }}>{title}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button type="button" className="mobile-settlement-manual-button" onClick={() => setShowManualInput(true)}>
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
                    {!!item.payerMemberId && (
                      <div className="mobile-settlement-receiver-info">
                    결제자: {members.find((m) => m.memberId === item.payerMemberId)?.nickname ?? item.payerMemberId} / {item.payerBankName} {item.payerAccountNumber}
                  </div>
                )}
                    <div className="mobile-settlement-divider" />
                    <div className="mobile-settlement-members">
                      <div className="mobile-settlement-payer-header">
                        <span>정산 참여자</span>
                        <button type="button" className="mobile-settlement-payer-toggle" onClick={() => togglePayerPanel(item.id)}>
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
                                    className={`mobile-settlement-member-avatar-option ${selected ? 'is-selected' : ''}`}
                                    onClick={() => handleTogglePayer(item.id, member.memberId)}
                                  >
                                    <UserAvatar name={member.nickname} colorKey={member.memberId} size="md" className="mobile-settlement-member-avatar" />
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
          <button type="button" className="mobile-settlement-action outline" onClick={() => setShowReceiptModal(true)}>
            <i className="ri-camera-line" />
            영수증 등록
          </button>
          <button
            type="button"
            className="mobile-settlement-action primary"
            onClick={() => setShowFinalizeConfirm(true)}
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
              <input className="mobile-settlement-manual-input" type="text" placeholder="영수증 제목 (예: 주유비)" value={receiptTitle} onChange={(event) => { setReceiptTitle(event.target.value); if (receiptError) setReceiptError(''); }} />
              <select className="mobile-settlement-manual-input" value={receiptPayerId} onChange={(event) => setReceiptPayerId(event.target.value)}>
                <option value="">결제자 선택</option>
                {members.map((member) => (
                  <option key={member.memberId} value={member.memberId}>{member.nickname}</option>
                ))}
              </select>
              <div className="mobile-settlement-manual-row">
                <input className="mobile-settlement-manual-input" type="text" placeholder="은행명" value={receiptBankName} onChange={(event) => setReceiptBankName(event.target.value)} />
                <input className="mobile-settlement-manual-input" type="text" placeholder="계좌번호" value={receiptAccountNumber} onChange={(event) => setReceiptAccountNumber(event.target.value)} />
              </div>

              <div className="receipt-camera-frame">
                {cameraError ? <div className="receipt-camera-placeholder">{cameraError}</div> : <video ref={receiptVideoRef} className="receipt-camera-video" autoPlay playsInline muted />}
                <div className="receipt-frame-guide" />
              </div>
              <p className="receipt-guide-text">영수증을 프레임 안에 맞춰 촬영해주세요.</p>

              {receiptError && <div className="mobile-settlement-manual-error">{receiptError}</div>}
            </div>

            <div className="receipt-modal-actions">
              <button type="button" className="receipt-action ghost" onClick={() => setShowReceiptModal(false)}>취소</button>
              <button type="button" className="receipt-action primary" onClick={handleCaptureReceipt}>촬영</button>
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
              <input className="mobile-settlement-manual-input" type="text" placeholder="상품명" value={manualName} onChange={(event) => setManualName(event.target.value)} />
              <div className="mobile-settlement-manual-row">
                <input className="mobile-settlement-manual-input" type="number" min={1} placeholder="개수" value={manualQty} onChange={(event) => setManualQty(event.target.value)} />
                <input className="mobile-settlement-manual-input" type="number" min={0} placeholder="개당 금액" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} />
              </div>
              <select className="mobile-settlement-manual-input" value={manualPayerId} onChange={(event) => setManualPayerId(event.target.value)}>
                <option value="">결제자 선택</option>
                {members.map((member) => (
                  <option key={member.memberId} value={member.memberId}>{member.nickname}</option>
                ))}
              </select>
              <div className="mobile-settlement-manual-row">
                <input className="mobile-settlement-manual-input" type="text" placeholder="은행명" value={manualBankName} onChange={(event) => setManualBankName(event.target.value)} />
                <input className="mobile-settlement-manual-input" type="text" placeholder="계좌번호" value={manualAccountNumber} onChange={(event) => setManualAccountNumber(event.target.value)} />
              </div>
              {manualError && <div className="mobile-settlement-manual-error">{manualError}</div>}
              <div className="mobile-settlement-manual-actions">
                <button type="button" className="mobile-settlement-manual-cancel" onClick={() => setShowManualInput(false)}>취소</button>
                <button type="submit" className="mobile-settlement-manual-submit">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFinalizeConfirm && (
        <div className="mobile-settlement-manual-modal">
          <div className="mobile-settlement-manual-backdrop" onClick={() => setShowFinalizeConfirm(false)} />
          <div className="mobile-settlement-manual-card">
            <div className="mobile-settlement-manual-title">등록 완료 확인</div>
            <div className="mobile-settlement-manual-error" style={{ color: '#374151' }}>
              등록완료 후 정산으로 넘어가면 더 이상 영수증 추가가 불가합니다.
              <br />
              완료 하시겠습니까?
            </div>
            <div className="mobile-settlement-manual-actions">
              <button
                type="button"
                className="mobile-settlement-manual-cancel"
                onClick={() => setShowFinalizeConfirm(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="mobile-settlement-manual-submit"
                onClick={async () => {
                  setShowFinalizeConfirm(false);
                  if (!roomId) {
                    navigate('/m');
                    return;
                  }

                  const currentMemberId = Number(sessionStorage.getItem('memberId') ?? '0');
                  if (currentMemberId > 0 && items.length > 0) {
                    try {
                      const payload = {
                        payerMemberId: currentMemberId,
                        totalAmount,
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
                  }

                  navigate(`/m/room/${encodeURIComponent(roomId)}/settlement/result`);
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

export default MobileSettlementPage;
