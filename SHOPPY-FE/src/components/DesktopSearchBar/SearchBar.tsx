import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // 입력 중에는 백엔드로 요청하지 않음
  };

  const handleSearchClick = () => {
    // 검색 버튼 클릭 시에만 백엔드로 요청
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter 키 입력 시에도 검색
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="search-bar">
      <svg
        className="search-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder=""
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button 
        type="button"
        className="search-label"
        onClick={handleSearchClick}
      >
        검색
      </button>
    </div>
  );
};

export default SearchBar;
