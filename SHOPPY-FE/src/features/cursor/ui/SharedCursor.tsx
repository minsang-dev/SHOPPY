import React, { useMemo } from 'react';
import { AVATAR_GRADIENTS } from '@/shared/ui/UserAvatar/UserAvatar';
import { useRoomMembersContext } from '@/features/room/fetch-members/model/RoomMembersProvider';
import type { CursorData } from '../model/useCursorRealtime';
import './SharedCursor.css';

interface SharedCursorProps {
  cursor: CursorData;
}

const getGradientColor = (colorKey: string): string => {
  const index = Math.abs(Number(colorKey)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

// 그라데이션에서 첫 번째 색상 추출 (커서 아이콘용)
const getPrimaryColor = (colorKey: string): string => {
  const gradient = getGradientColor(colorKey);
  const match = gradient.match(/#[a-fA-F0-9]{6}/);
  return match ? match[0] : '#667eea';
};

const SharedCursor: React.FC<SharedCursorProps> = ({ cursor }) => {
  const { nickname, colorKey, x, y } = cursor;
  const { members } = useRoomMembersContext();

  // 입장 순서 기반 colorKey 계산 (참여자 목록과 동일한 방식)
  const joinOrderColorKey = useMemo(() => {
    const memberId = Number(colorKey);
    if (!memberId || members.length === 0) return colorKey;

    const sorted = [...members].sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );
    const index = sorted.findIndex((m) => m.memberId === memberId);
    return index >= 0 ? String(index) : colorKey;
  }, [members, colorKey]);

  // 영역 밖이면 렌더링 안 함
  if (x < 0 || y < 0 || x > 1 || y > 1) {
    return null;
  }

  const primaryColor = getPrimaryColor(joinOrderColorKey);

  return (
    <div
      className="shared-cursor"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
      }}
    >
      {/* 커서 아이콘 */}
      <svg
        className="shared-cursor-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
          fill={primaryColor}
          stroke="#fff"
          strokeWidth="1.5"
        />
      </svg>

      {/* 닉네임 라벨 */}
      <div
        className="shared-cursor-label"
        style={{ background: primaryColor }}
      >
        {nickname}
      </div>
    </div>
  );
};

export default SharedCursor;
