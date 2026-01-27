import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import './styles.css';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mypage">
      <h1>마이페이지</h1>
      {user?.profileImage && (
        <img
          src={user.profileImage}
          alt="프로필"
          className="mypage-profile-image"
        />
      )}
      <p>닉네임: {user?.nickname}</p>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
};

export default MyPage;