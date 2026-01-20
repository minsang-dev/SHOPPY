import React from 'react';
import Header from '../components/DesktopHeader/Header';
import HeroSection from '../components/DesktopHeroSection/HeroSection';
import RecommendedProducts from '../components/DesktopRecommendedProducts/RecommendedProducts';
import './DesktopmainPage.css';

const MainPage: React.FC = () => {
  return (
    <div className="main-page">
      <Header />
      <main className="main-content">
        <HeroSection />
        <RecommendedProducts />
      </main>
    </div>
  );
};

export default MainPage;
