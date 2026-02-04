import React, { useState } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useModalStore } from '@/shared/model/useModalStore';
import { useAuthStore } from '@/entities/user';
import { LoginModal } from '@/widgets/desktop/LoginModal';
import './Header.css';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const { openLoginModal } = useModalStore();
  const { isLoggedIn, user } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isInRoom = location.pathname.startsWith('/rooms/') && roomId;
  const homePath = isInRoom ? `/rooms/${roomId}` : '/';
  const productsPath = isInRoom ? `/rooms/${roomId}/products` : '/products';
  const profileButtonLabel = isInRoom ? '정산페이지' : '마이페이지';
  const profileButtonIcon = isInRoom ? 'ri-calculator-line' : 'ri-user-line';
  const profileButtonPath = isInRoom ? `/rooms/${roomId}/settlement` : `/myPage/${user?.id}`;

  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        <div className="header-logo">
          <NavLink to={homePath}>
            <img src="/images/shoppingMall_main_logo.png" alt="SHOPPY Logo" className="logo-image" />
            <span className="logo-text">SHOPPY</span>
          </NavLink>
        </div>

        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="메뉴 열기">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header-menu ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to={homePath} className="nav-link">
            Home
          </NavLink>
          <a href="#" className="nav-link">
            Best
          </a>
          <NavLink to={productsPath} className="nav-link">
            Product
          </NavLink>
          <a href="#" className="nav-link">
            FAQ
          </a>
        </nav>

        <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
          {isInRoom ? (
            <button className="btn-profile" onClick={() => navigate(profileButtonPath)}>
              <i className={profileButtonIcon} aria-hidden />
              <span className="header-profile-tooltip">정산하기</span>
            </button>
          ) : isLoggedIn ? (
            <button className="btn-profile" onClick={() => navigate(profileButtonPath)}>
              <i className={profileButtonIcon} aria-hidden />
              <span className="header-profile-tooltip">{profileButtonLabel}</span>
            </button>
          ) : (
            <button onClick={openLoginModal} className="btn-login">
              Login
            </button>
          )}
          <LoginModal />
        </div>
      </div>
    </header>
  );
};

export default Header;
