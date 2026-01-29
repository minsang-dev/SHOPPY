import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKakaoAuth } from '@/features/auth/LoginByKakao';

export const KakaoCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useKakaoAuth();
  const code = searchParams.get('code');
  const isProcessing = useRef(false);

  useEffect(() => {
    if (code && !isProcessing.current) {
      isProcessing.current = true;
      login(code);
    }
  }, [code, login]);

  return <div>로그인 처리 중...</div>;
};