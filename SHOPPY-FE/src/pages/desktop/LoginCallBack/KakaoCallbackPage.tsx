import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKakaoAuth } from '@/features/auth/LoginByKakao';
import './KakaoCallbackPage.css';

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

  return (
    <div className="kakao-callback-page">
      <div className="kakao-callback-loading" />
      <p className="kakao-callback-text">카카오 로그인 중...</p>
    </div>
  );
};