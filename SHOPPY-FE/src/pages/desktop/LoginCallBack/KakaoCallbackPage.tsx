import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getKakaoToken, useAuthStore } from '@/entities/user';

export const KakaoCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      getKakaoToken(code)
        .then((data) => {
          setAuth(data.accessToken, {
            id: data.memberId,
            nickname: data.nickname,
            profileImage: data.profileImageUrl,
          });
          localStorage.setItem('refreshToken', data.refreshToken);
          navigate('/');
        })
        .catch(() => {
          alert('로그인 실패');
          navigate('/');
        });
    }
  }, [code, navigate, setAuth]);

  return <div>로그인 처리 중...</div>;
};