import axios from 'axios';
import type { KakaoAuthResponse } from '../types/user.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 카카오 인가코드를 백엔드에 전송하여 토큰 교환
export const postKakaoCode = async (code: string): Promise<KakaoAuthResponse> => {
  // TODO: 백엔드 API 주소 확정 후 수정
  const response = await axios.post<KakaoAuthResponse>(
    `${API_BASE_URL}/api/auth/kakao`,
    { code }
  );
  return response.data;
};
