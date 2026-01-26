import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
// (entity/session/store 등에서 setToken 가져오기)

export const KakaoCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      console.log('카카오 인가코드:', code);
      // 1. 백엔드로 인가 코드 전송
      axios.post('/api/accounts/kakao/login/', { code })
        .then(res => {
           // 2. 토큰 저장 (Zustand store 혹은 LocalStorage)
           localStorage.setItem('accessToken', res.data.accessToken);
           
           // 3. 메인으로 복귀
           navigate('/'); 
        })
        .catch(() => {
           alert('로그인 실패');
           navigate('/');
        });
    }
  }, [code, navigate]);

  return <div>로그인 처리 중...</div>;
};