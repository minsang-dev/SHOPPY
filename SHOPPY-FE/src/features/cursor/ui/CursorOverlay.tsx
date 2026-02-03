import React, { useRef, useEffect, useMemo } from 'react';
import { useCursorRealtime } from '../model/useCursorRealtime';
import { useRoomMembersContext } from '@/features/room/fetch-members/model/RoomMembersProvider';
import SharedCursor from './SharedCursor';
import './CursorOverlay.css';

interface CursorOverlayProps {
  roomId: string | undefined;
  userId: number | undefined;
  nickname: string;
  colorKey: string;
  enabled: boolean;
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({
  roomId,
  userId,
  nickname,
  colorKey,
  enabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { members } = useRoomMembersContext();

  // 입장 순서 기반 colorKey 계산 (참여자 목록과 동일한 방식)
  const joinOrderColorKey = useMemo(() => {
    const memberId = Number(colorKey);
    if (!memberId || members.length === 0) return colorKey;

    // joinedAt 기준 정렬
    const sorted = [...members].sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );
    const index = sorted.findIndex((m) => m.memberId === memberId);
    return index >= 0 ? String(index) : colorKey;
  }, [members, colorKey]);

  const { cursors, publishCursor } = useCursorRealtime({
    roomId,
    userId,
    nickname,
    colorKey: joinOrderColorKey,
    enabled,
  });

  // document 레벨에서 mousemove 감지 (부모의 pointerEvents: none 영향 안 받음)
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // closure 대신 항상 최신 ref 참조
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const rect = currentContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // [DEBUG] rect 값 확인
      console.log('[CURSOR DEBUG] rect:', {
        element: currentContainer.className,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        clientX: e.clientX,
        clientY: e.clientY,
        x,
        y,
      });

      // 영역 내에서만 커서 발행, 영역 밖이면 숨김 신호 (-1)
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        publishCursor(x, y);
      } else {
        publishCursor(-1, -1);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, publishCursor]);

  // [DEBUG] 렌더링 상태 확인
  console.log('[CURSOR DEBUG] CursorOverlay 렌더링:', {
    enabled,
    userId,
    cursorsCount: cursors.size,
    cursors: Array.from(cursors.entries()),
  });

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="cursor-overlay">
      {Array.from(cursors.values()).map((cursor) => (
        <SharedCursor key={cursor.userId} cursor={cursor} />
      ))}
    </div>
  );
};

export default CursorOverlay;
