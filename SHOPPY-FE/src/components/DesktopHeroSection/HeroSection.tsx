import React, { useState } from 'react';
import Button from '../DesktopButton/Button';
import RoomModal from '../DesktopRoomModal/RoomModal';
import './HeroSection.css';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className={`hero-section ${className}`}>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              실시간 협업 쇼핑을<br />
              시작해 보세요
            </h1>
            <Button
              variant="primary"
              size="large"
              onClick={handleStartClick}
              className="hero-button"
            >
              시작하기
            </Button>
          </div>
          <div className="hero-image">
            <img
              src="images/shoppingMall_main_laptop.png"
              alt="실시간 협업 쇼핑"
              className="laptop-image"
            />
          </div>
        </div>
      </div>
      <RoomModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
};

export default HeroSection;
