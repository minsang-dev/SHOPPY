import React from 'react';
import './Header.css';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        <div className="header-logo">
          <a href="/">
            <img src="images/shoppingMall_main_logo.png" alt="SHOPPY Logo" className="logo-image" />
            <span className="logo-text">SHOPPY</span>
          </a>
        </div>
        
        <nav className="header-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/best" className="nav-link">Best</a>
          <a href="/product" className="nav-link">Product</a>
          <a href="/faq" className="nav-link">FAQ</a>
        </nav>
        
        <div className="header-actions">
          <a href="/login" className="btn-login">Login</a>
          <a href="/signup" className="btn-signup">Sign up</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
