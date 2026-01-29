import { useCallback, useEffect, useState } from 'react';
import { getRoomMembers } from '../../../../entities/room/api/room';
import type { RoomMember } from '../../../../entities/room/types/room.types';

interface UseRoomMembersState {
  members: RoomMember[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  applyEvent: (event: {
    type: 'JOINED' | 'LEFT' | 'STATE_UPDATED';
    member: RoomMember;
  }) => void;
}

export const useRoomMembers = (roomId?: string): UseRoomMembersState => {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyEvent = useCallback(
    (event: { type: 'JOINED' | 'LEFT' | 'STATE_UPDATED'; member: RoomMember }) => {
      setMembers((prev) => {
        const exists = prev.find((item) => item.memberId === event.member.memberId);

        if (event.type === 'LEFT') {
          return prev.filter((item) => item.memberId !== event.member.memberId);
        }

        if (exists) {
          return prev.map((item) =>
            item.memberId === event.member.memberId ? { ...item, ...event.member } : item,
          );
        }

        return [...prev, event.member];
      });
    },
    [],
  );

  const reload = useCallback(async () => {
    if (!roomId) {
      return;
    }
    try {
      setLoading(true);
      const data = await getRoomMembers(roomId);
      setMembers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load room members:', err);
      setError('참여자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { members, loading, error, reload, applyEvent };
};
