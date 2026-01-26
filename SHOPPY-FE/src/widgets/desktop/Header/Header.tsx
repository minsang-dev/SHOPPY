import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useModalStore } from '@/shared/model/useModalStore';
import { LoginModal } from '@/widgets/desktop/LoginModal';
import './Header.css';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { openLoginModal } = useModalStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 현재 경로가 /room으로 시작하는지 확인
  const isInRoom = location.pathname.startsWith('/room');
  const homePath = isInRoom ? '/room' : '/';
  const productsPath = isInRoom ? '/room/products' : '/products';

  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        <div className="header-logo">
          <NavLink to={homePath}>
            <img src="/images/shoppingMall_main_logo.png" alt="SHOPPY Logo" className="logo-image" />
            <span className="logo-text">SHOPPY</span>
          </NavLink>
        </div>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="메뉴 토글"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`header-menu ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to={homePath} className="nav-link">Home</NavLink>
          <a href="#" className="nav-link">Best</a>
          <NavLink to={productsPath} className="nav-link">
            Product
          </NavLink>
          <a href="#" className="nav-link">FAQ</a>
        </nav>
        
        <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
          <button onClick={openLoginModal} className="btn-login">
            Login
          </button>
          <LoginModal />
        </div>
      </div>
    </header>
  );
};

export default Header;
