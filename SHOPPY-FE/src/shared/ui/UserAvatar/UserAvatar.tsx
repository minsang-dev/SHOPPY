import React from 'react';
import { getAvatarGradient, getAvatarInitial } from './UserAvatar.constants';
import './UserAvatar.css';

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
  const gradient = getAvatarGradient(colorKey ?? name);

  return (
    <div
      className={`user-avatar user-avatar--${size} ${className}`}
      style={{ background: gradient }}
    >
      <span>{getAvatarInitial(name)}</span>
    </div>
  );
};

export default UserAvatar;
