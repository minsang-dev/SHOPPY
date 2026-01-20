import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import RecommendedProducts from '../components/RecommendedProducts/RecommendedProducts';
import './mainPage.css';

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
