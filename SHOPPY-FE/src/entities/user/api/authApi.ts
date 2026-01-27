import type {
  KakaoLoginResponse,
  TokenRefreshResponse,
} from '../types/user.types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 카카오 인가코드로 로그인
export const getKakaoToken = async (code: string): Promise<KakaoLoginResponse['data']> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/auth/kakao/callback`,
    { params: { code } },
  );

  return response.data.data;
};

// 토큰 갱신
export const refreshAccessToken = async (refreshToken: string): Promise<TokenRefreshResponse['data']> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken },
  );

  return response.data.data;
};
