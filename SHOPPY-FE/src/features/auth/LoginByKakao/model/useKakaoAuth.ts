import { useNavigate } from 'react-router-dom';
// TODO: 백엔드 연결 후 주석 해제
// import { postKakaoCode } from '@/entities/user/api/authApi';
// import { useAuthStore } from '@/entities/user/model/useAuthStore';

export const useKakaoAuth = () => {
  const navigate = useNavigate();
  // TODO: 백엔드 연결 후 주석 해제
  // const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (code: string) => {
    try {
      // TODO: 백엔드 연결 전 테스트용 로그
      console.log('[카카오 인가코드 수신 성공]');
      console.log('code:', code);

      // TODO: 백엔드 연결 후 아래 주석 해제
      // const { accessToken, user } = await postKakaoCode(code);
      // setAuth(accessToken, user);
      // navigate('/');

      // 테스트용: 3초 후 메인으로 이동
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('[카카오 로그인 실패]', error);
      navigate('/');
    }
  };

  return { login };
};
