import React from 'react';
import './MobileBottomNav.css';

export type BottomNavType = 'cart' | 'vote' | 'members' | 'chat';

interface MobileBottomNavProps {
  active: BottomNavType;
  onChange: (value: BottomNavType) => void;
}

const items: Array<{ id: BottomNavType; label: string; icon: string }> = [
  { id: 'cart', label: '장바구니', icon: 'ri-shopping-cart-line' },
  { id: 'vote', label: '투표', icon: 'ri-checkbox-multiple-line' },
  { id: 'members', label: '참여자 목록', icon: 'ri-group-line' },
  { id: 'chat', label: '채팅', icon: 'ri-chat-3-line' },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ active, onChange }) => {
  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mobile-bottom-nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
          aria-label={item.label}
        >
          <i className={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
