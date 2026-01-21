import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        <div className="header-logo">
          <a href="/">
            <img src="images/shoppingMall_main_logo.png" alt="SHOPPY Logo" className="logo-image" />
            <span className="logo-text">SHOPPY</span>
          </a>
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
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Best</a>
          <a href="#" className="nav-link">Product</a>
          <a href="#" className="nav-link">FAQ</a>
        </nav>
        
        <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
          <a href="#" className="btn-login">Login</a>
          <a href="#" className="btn-signup">Sign up</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
