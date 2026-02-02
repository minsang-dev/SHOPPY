import React from 'react';
import './UserAvatar.css';

/** 화상채팅 참여자 최대 10명용 - 이전 10개 색상에서 순서만 재배치 (입장 순서=색상 순서) */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #dd6f8f 0%, #ea846c 100%)',
  'linear-gradient(135deg, #3c98f2 0%, #65b4ff 100%)',
  'linear-gradient(135deg, #d99533 0%, #e6ad52 100%)',
  'linear-gradient(135deg, #c968a4 0%, #db87ba 100%)',
  'linear-gradient(135deg, #7d57cc 0%, #9a78e0 100%)',
  'linear-gradient(135deg, #5f81d6 0%, #7ea0e6 100%)',
  'linear-gradient(135deg, #41b983 0%, #64cca1 100%)',
  'linear-gradient(135deg, #7f8ea3 0%, #9aa9be 100%)',
  'linear-gradient(135deg, #6298de 0%, #82b1e9 100%)',
  'linear-gradient(135deg, #d26e93 0%, #e49a42 100%)',
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
