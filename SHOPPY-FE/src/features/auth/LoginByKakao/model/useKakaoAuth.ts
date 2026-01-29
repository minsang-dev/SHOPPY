import { useNavigate } from 'react-router-dom';
import { getKakaoToken, useAuthStore } from '@/entities/user';

export const useKakaoAuth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (code: string) => {
    try {
      console.log('[카카오 인가코드 수신]', code);

      const data = await getKakaoToken(code);
      console.log('[로그인 응답]', data);

      setAuth(data.accessToken, {
        id: data.memberId,
        nickname: data.nickname,
        profileImage: data.profileImageUrl,
      });
      localStorage.setItem('refreshToken', data.refreshToken);

      navigate('/');
    } catch (error) {
      console.error('[카카오 로그인 실패]', error);
      alert('로그인 실패');
      navigate('/');
    }
  };

  return { login };
};
