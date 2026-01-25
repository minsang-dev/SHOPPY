import React, { useState } from 'react';
import './SortOptions.css';

type SortOption = 'default' | 'priceLow' | 'priceHigh';

interface SortOptionsProps {
  onSortChange?: (option: SortOption) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ onSortChange }) => {
  const [selectedOption, setSelectedOption] = useState<SortOption>('default');

  const handleSortClick = (option: SortOption) => {
    setSelectedOption(option);
    if (onSortChange) {
      onSortChange(option);
    }
  };

  return (
    <div className="filter-options">
      <button
        className={`filter-option ${selectedOption === 'default' ? 'active' : ''}`}
        onClick={() => handleSortClick('default')}
      >
        기본순
      </button>
      <span className="filter-separator">·</span>
      <button
        className={`filter-option ${selectedOption === 'priceLow' ? 'active' : ''}`}
        onClick={() => handleSortClick('priceLow')}
      >
        낮은 가격순
      </button>
      <span className="filter-separator">·</span>
      <button
        className={`filter-option ${selectedOption === 'priceHigh' ? 'active' : ''}`}
        onClick={() => handleSortClick('priceHigh')}
      >
        높은 가격순
      </button>
    </div>
  );
};

export default SortOptions;
