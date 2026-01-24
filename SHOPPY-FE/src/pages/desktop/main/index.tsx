import React from 'react';
import Header from '../../../widgets/desktop/DesktopHeader/Header';
import HeroSection from '../../../widgets/desktop/DesktopHeroSection/HeroSection';
import RecommendedProducts from '../../../widgets/desktop/DesktopRecommendedProducts/RecommendedProducts';
// 파일명 대소문자 통일 (m -> M) 권장
import './styles.css'; 

// 1. Props 정의 삭제: 외부에서 '헤더 숨겨줘'라고 요청할 일이 없으므로 제거했습니다.

const MainPage: React.FC = () => {
  return (
    <div className="main-page">
      {/* 2. 조건문 삭제: 이제 헤더는 조건 없이 무조건 렌더링됩니다. */}
      <Header />
      
      <main className="main-content">
        <HeroSection />
        <RecommendedProducts />
      </main>
    </div>
  );
};

export default MainPage;