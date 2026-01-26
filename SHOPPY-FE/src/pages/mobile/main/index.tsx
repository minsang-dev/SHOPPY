import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/ui/DesktopButton/Button';
import InviteLinkCard from '../../../shared/ui/InviteLinkCard/InviteLinkCard';
import { useJoinRoom } from '../../../features/room/model/useJoinRoom';
import './styles.css';

const navItems = ['Home', 'Best', 'Product', 'FAQ'];

const products = [
  { image: '/images/product1.png', alt: '추천 상품 1' },
  { image: '/images/product2.png', alt: '추천 상품 2' },
  { image: '/images/product3.png', alt: '추천 상품 3' },
  { image: '/images/product4.png', alt: '추천 상품 4' },
];

const parseRoomCode = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    const codeFromQuery = url.searchParams.get('code') ?? url.searchParams.get('roomCode');
    if (codeFromQuery) {
      return codeFromQuery;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? trimmed;
  } catch {
    return trimmed;
  }
};

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const { loading, error, run } = useJoinRoom();

  const handleStartClick = () => {
    setShowInvite(true);
  };

  const handleInviteClose = () => {
    setShowInvite(false);
  };

  const handleInviteEnter = async ({ link, nickname }: { link: string; nickname: string }) => {
    const roomCode = parseRoomCode(link);
    const trimmedNickname = nickname.trim();
    if (!roomCode || !trimmedNickname) {
      return;
    }

    const response = await run({ roomCode, nickname: trimmedNickname });

    const query = new URLSearchParams({
      room_id: String(response.roomId),
      nickname: trimmedNickname,
    });

    setShowInvite(false);
    navigate(`/m/room?${query.toString()}`);
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
            login
          </button>
          <button type="button" className="mobile-main-signup">
            sign up
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
          <h1 className="mobile-main-title">혼자 말고 같이 쇼핑해요</h1>
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
          <img src="/images/shoppingMall_main_laptop.png" alt="라이브 쇼핑 화면" />
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
          <InviteLinkCard
            onClose={handleInviteClose}
            onEnter={handleInviteEnter}
            loading={loading}
            error={error?.message}
          />
        </div>
      )}
    </div>
  );
};

export default MobileMainPage;
