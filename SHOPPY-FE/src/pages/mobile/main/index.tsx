import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/ui/DesktopButton/Button';
import InviteLinkCard from '../../../shared/ui/InviteLinkCard/InviteLinkCard';
import './styles.css';

const navItems = ['Home', 'Best', 'Product', 'FAQ'];

const products = [
  { image: '/images/product1.png', alt: '추천 상품 1' },
  { image: '/images/product2.png', alt: '추천 상품 2' },
  { image: '/images/product3.png', alt: '추천 상품 3' },
  { image: '/images/product4.png', alt: '추천 상품 4' },
];

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);

  const handleStartClick = () => {
    setShowInvite(true);
  };

  const handleInviteClose = () => {
    setShowInvite(false);
  };

  const handleInviteEnter = () => {
    setShowInvite(false);
    navigate('/m/room');
  };

  return (
    <div className="mobile-main-page">
      <header className="mobile-main-header">
        <div className="mobile-main-brand">
          <img
            src="/images/shoppingMall_main_logo.png"
            alt="SHOPPY Logo"
            className="mobile-main-logo"
          />
          <span className="mobile-main-brand-text">SHOPPY</span>
        </div>
        <div className="mobile-main-actions">
          <button type="button" className="mobile-main-login">
            Login
          </button>
          <button type="button" className="mobile-main-signup">
            Sign up
          </button>
        </div>
      </header>

      <nav className="mobile-main-nav">
        {navItems.map((item) => (
          <button key={item} type="button" className="mobile-main-nav-item">
            {item}
          </button>
        ))}
      </nav>

      <section className="mobile-main-hero">
        <div className="mobile-main-hero-text">
          <h1 className="mobile-main-title">
            실시간 협업 쇼핑을
            <br />
            시작해 보세요
          </h1>
          <Button
            variant="primary"
            size="large"
            className="mobile-main-cta"
            onClick={handleStartClick}
          >
            시작하기
          </Button>
        </div>
        <div className="mobile-main-hero-image">
          <img src="/images/shoppingMall_main_laptop.png" alt="협업 쇼핑 데모" />
        </div>
      </section>

      <section className="mobile-main-products">
        <h2 className="mobile-main-products-title">추천 상품</h2>
        <div className="mobile-main-products-grid">
          {products.map((product) => (
            <div key={product.image} className="mobile-main-product-card">
              <img src={product.image} alt={product.alt} />
            </div>
          ))}
        </div>
      </section>

      {showInvite && (
        <div className="mobile-main-invite-overlay">
          <InviteLinkCard onClose={handleInviteClose} onEnter={handleInviteEnter} />
        </div>
      )}
    </div>
  );
};

export default MobileMainPage;
