import React from 'react';
import './MobileBottomNav.css';

export type BottomNavType = 'cart' | 'vote' | 'members' | 'chat';

interface MobileBottomNavProps {
  active: BottomNavType;
  onChange: (value: BottomNavType) => void;
}

const items: Array<{ id: BottomNavType; label: string }> = [
  { id: 'cart', label: '장바구니' },
  { id: 'vote', label: '투표' },
  { id: 'members', label: '참여자 목록' },
  { id: 'chat', label: '채팅' },
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
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
