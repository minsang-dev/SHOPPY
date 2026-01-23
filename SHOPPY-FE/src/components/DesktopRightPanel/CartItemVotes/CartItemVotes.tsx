import React from 'react';
import './CartItemVotes.css';

interface CartItemVotesProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

/**
 * 장바구니 아이템 투표 컴포넌트
 * 좋아요/싫어요 버튼을 제공
 */
const CartItemVotes: React.FC<CartItemVotesProps> = ({ likes, dislikes, onLike, onDislike }) => {
  return (
    <div className="cart-item-votes">
      <button
        className="vote-btn like-btn"
        onClick={onLike}
        aria-label="좋아요"
      >
        <i className="ri-thumb-up-line"></i>
        <span>{likes}</span>
      </button>
      <button
        className="vote-btn dislike-btn"
        onClick={onDislike}
        aria-label="싫어요"
      >
        <i className="ri-thumb-down-line"></i>
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default CartItemVotes;
