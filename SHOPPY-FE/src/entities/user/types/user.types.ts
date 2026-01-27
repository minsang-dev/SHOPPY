export interface User {
  id: number;
  nickname: string;
  profileImage?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface KakaoLoginResponse {
  status: string;
  message: string;
  data: {
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    accessToken: string;
    refreshToken: string;
    newMember: boolean;
  };
}
