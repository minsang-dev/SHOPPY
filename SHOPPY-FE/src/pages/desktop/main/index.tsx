import React from 'react';
import Header from '../../../widgets/desktop/Header/Header';
import HeroSection from '../../../widgets/desktop/HeroSection/HeroSection';
import RecommendedProducts from '../../../widgets/desktop/RecommendedProducts/RecommendedProducts';
import './styles.css'; 


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