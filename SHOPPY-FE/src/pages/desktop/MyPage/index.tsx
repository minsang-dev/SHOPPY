import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import Header from '@/widgets/desktop/Header/Header';
import './styles.css';

type MyPageMenu = 'profile' | 'shared-cart' | 'wishlist';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MyPageMenu>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (menu: MyPageMenu) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <div className="mypage-layout">
      <Header />

      <button
        type="button"
        className="mypage-mobile-toggle"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="메뉴 열기"
        aria-expanded={mobileMenuOpen}
      >
        <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} aria-hidden />
      </button>

      <div
        className="mypage-mobile-backdrop"
        data-open={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden
      />

      <aside
        className="mypage-sidebar"
        data-collapsed={sidebarCollapsed}
        data-mobile-open={mobileMenuOpen}
        style={{ '--mypage-sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div className="mypage-sidebar-inner">
          <div className="mypage-sidebar-header">
            <h2 className="mypage-sidebar-title">마이페이지</h2>
            <button
              type="button"
              className="mypage-sidebar-collapse"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              title={sidebarCollapsed ? '펼치기' : '접기'}
            >
              <i className={sidebarCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} aria-hidden />
            </button>
          </div>

          <nav className="mypage-sidebar-nav">
            <button
              type="button"
              className={`mypage-sidebar-item ${activeMenu === 'profile' ? 'is-active' : ''}`}
              onClick={() => handleMenuClick('profile')}
              title="회원정보"
            >
              <i className="ri-user-line" aria-hidden />
              <span className="mypage-sidebar-item-text">회원정보</span>
            </button>
            <button
              type="button"
              className={`mypage-sidebar-item ${activeMenu === 'shared-cart' ? 'is-active' : ''}`}
              onClick={() => handleMenuClick('shared-cart')}
              title="내 공유 장바구니"
            >
              <i className="ri-shopping-cart-line" aria-hidden />
              <span className="mypage-sidebar-item-text">내 공유 장바구니</span>
            </button>
            <button
              type="button"
              className={`mypage-sidebar-item ${activeMenu === 'wishlist' ? 'is-active' : ''}`}
              onClick={() => handleMenuClick('wishlist')}
              title="찜 목록"
            >
              <i className="ri-heart-line" aria-hidden />
              <span className="mypage-sidebar-item-text">찜 목록</span>
            </button>
          </nav>

          <div className="mypage-sidebar-footer">
            <button
              type="button"
              className="mypage-sidebar-item mypage-sidebar-logout"
              onClick={handleLogout}
              title="로그아웃"
            >
              <i className="ri-logout-box-r-line" aria-hidden />
              <span className="mypage-sidebar-item-text">로그아웃</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        className="mypage-main"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="mypage-main-inner">
          {activeMenu === 'profile' && (
            <section className="mypage-content">
              <h1 className="mypage-content-title">회원정보</h1>
              <div className="mypage-profile-card">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="프로필"
                    className="mypage-profile-image"
                  />
                ) : (
                  <div className="mypage-profile-avatar" aria-hidden>
                    {user?.nickname?.charAt(0) ?? '?'}
                  </div>
                )}
                <p className="mypage-profile-greeting">
                  {user?.nickname ?? '회원'}님 안녕하세요 !
                </p>
              </div>
            </section>
          )}

          {activeMenu === 'shared-cart' && (
            <section className="mypage-content">
              <h1 className="mypage-content-title">내 공유 장바구니</h1>
              <div className="mypage-placeholder-card">
                <i className="ri-shopping-cart-line mypage-placeholder-icon" aria-hidden />
                <p className="mypage-placeholder-text">참여 중인 공유 장바구니 목록이 여기에 표시됩니다.</p>
              </div>
            </section>
          )}

          {activeMenu === 'wishlist' && (
            <section className="mypage-content">
              <h1 className="mypage-content-title">찜 목록</h1>
              <div className="mypage-placeholder-card">
                <i className="ri-heart-line mypage-placeholder-icon" aria-hidden />
                <p className="mypage-placeholder-text">찜한 상품 목록이 여기에 표시됩니다.</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPage;
