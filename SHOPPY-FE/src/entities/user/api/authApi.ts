import axios from 'axios';
import type { KakaoLoginResponse } from '../types/user.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 카카오 인가코드로 로그인
export const getKakaoToken = async (code: string): Promise<KakaoLoginResponse['data']> => {
  const response = await axios.get<KakaoLoginResponse>(
    `${API_BASE_URL}/api/auth/kakao/callback`,
    { params: { code } }
  );
  return response.data.data;
};

// 토큰 갱신
export const refreshToken = async (refreshToken: string): Promise<KakaoLoginResponse['data']> => {
  const response = await axios.post<KakaoLoginResponse>(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken }
  );
  return response.data.data;
};
