import './KakaoLoginButton.css';

export const KakaoLoginButton = () => {
  const handleLogin = () => {
    // 백엔드 연결 전 프론트엔드만 구현
    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
    const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <button onClick={handleLogin} className="kakao-login-button">
      <svg 
        className="kakao-icon" 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M9 0C4.03 0 0 3.22 0 7.19c0 2.62 1.69 4.94 4.22 6.24L3.38 18l4.5-2.81c.5.05 1 .09 1.5.09 4.97 0 9-3.22 9-7.19C18 3.22 13.97 0 9 0z" 
          fill="#000000"
        />
      </svg>
      <span className="kakao-login-text">카카오톡으로 3초 만에 시작하기</span>
    </button>
  );
};
