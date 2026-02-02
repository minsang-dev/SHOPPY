import React, { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useRoomMembers } from './useRoomMembers';
import { realtimeConfig } from '@/shared/config/realtime';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsMembers,
} from '@/shared/lib/realtime';
import type { RoomMember } from '@/entities/room/types/room.types';

interface RoomMembersContextValue {
  members: RoomMember[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const RoomMembersContext = createContext<RoomMembersContextValue | null>(null);

const resolveToken = () =>
  sessionStorage.getItem('accessToken') ??
  sessionStorage.getItem('access_token') ??
  undefined;

interface RoomMembersProviderProps {
  roomId: string | undefined;
  children: ReactNode;
}

/**
 * 방 참여자 목록을 페이지 레벨에서 관리하는 Provider.
 * WebSocket 구독을 여기서 처리하여 패널 전환 시 연결이 끊기지 않도록 함.
 */
export const RoomMembersProvider: React.FC<RoomMembersProviderProps> = ({ roomId, children }) => {
  const { members, loading, error, reload, applyEvent } = useRoomMembers(roomId);
  const applyEventRef = useRef(applyEvent);

  useEffect(() => {
    applyEventRef.current = applyEvent;
  }, [applyEvent]);

  // WebSocket 구독: 페이지 레벨에서 관리하여 패널 전환과 무관하게 연결 유지
  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        subscription = subscribeTopic(client, topicRoomsMembers(roomId), (body) => {
          try {
            const payload = JSON.parse(body) as {
              type: 'JOINED' | 'LEFT' | 'STATE_UPDATED';
              member: RoomMember;
            };
            if (payload?.member && payload?.type) {
              applyEventRef.current({ type: payload.type, member: payload.member });
            }
          } catch (err) {
            console.error('Failed to parse member event:', err);
          }
        });
      })
      .catch((err) => {
        console.error('RoomMembers WebSocket connection failed:', err);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId]);

  return (
    <RoomMembersContext.Provider value={{ members, loading, error, reload }}>
      {children}
    </RoomMembersContext.Provider>
  );
};

/**
 * RoomMembersProvider 내부에서 참여자 목록에 접근하기 위한 훅.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useRoomMembersContext = (): RoomMembersContextValue => {
  const ctx = useContext(RoomMembersContext);
  if (!ctx) {
    throw new Error('useRoomMembersContext must be used within RoomMembersProvider');
  }
  return ctx;
};
