export interface User {
  id: number;
  nickname: string;
  profileImage?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface KakaoAuthResponse {
  accessToken: string;
  user?: User;
}
