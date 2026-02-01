import React from 'react';
import './UserAvatar.css';

/** 화상채팅 참여자 최대 10명용 - 이전 10개 색상에서 순서만 재배치 (입장 순서=색상 순서) */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', // 1. Strong Red
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 2. Sky Blue
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // 3. Citrus Zest
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', // 4. Warm Sunset
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // 5. Lavender
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 6. Royal Plum
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // 7. Morning Mint
  'linear-gradient(135deg, #434343 0%, #000000 100%)', // 8. Deep Space
  'linear-gradient(135deg, #3b82f6 0%, #bae6fd 100%)', // 9. Night Sky
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 10. Rose Gold
];

const getGradient = (colorKey: string | number): string => {
  const key = typeof colorKey === 'number' ? colorKey : colorKey.toString().charCodeAt(0);
  const index = Math.abs(key) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

const getInitial = (name: string): string => name.charAt(0) || '?';

interface UserAvatarProps {
  name: string;
  /** memberId 등 - 사용자별 동일 색상 유지 (없으면 name 기반) */
  colorKey?: string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  colorKey,
  className = '',
  size = 'md',
}) => {
  const gradient = getGradient(colorKey ?? name);

  return (
    <div
      className={`user-avatar user-avatar--${size} ${className}`}
      style={{ background: gradient }}
    >
      <span>{getInitial(name)}</span>
    </div>
  );
};

export default UserAvatar;
