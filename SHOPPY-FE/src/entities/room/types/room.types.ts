export interface JoinRoomRequest {
  roomCode: string;
  nickname: string;
}

export interface JoinRoomAsUserRequest {
  roomCode: string;
}

export interface JoinRoomAsGuestRequest {
  roomCode: string;
  nickname: string;
}

export interface JoinRoomResponse {
  memberId: number;
  roomId: number;
  userId: number | null;
  nickname: string;
  role: string;
  status: string;
  isCameraOn: boolean;
  joinedAt: string;
}

export interface JoinRoomAsGuestResponse {
  member: JoinRoomResponse;
  accessToken: string;
}

export interface RoomResponse {
  roomId: number;
  hostId: number;
  roomName: string;
  inviteCode: string;
  roomStatus: string;
  targetBudget: string | number | null;
  hostCurrentUrl: string | null;
}

export interface RoomMember {
  memberId: number;
  roomId: number;
  userId: number | null;
  nickname: string;
  role: string;
  status: string;
  isCameraOn: boolean;
  joinedAt: string;
  syncMode?: SyncMode;
  /** 로그인 사용자의 프로필 이미지 URL (API에서 반환 시) */
  profileImage?: string | null;
}

export interface RoomMeta {
  shoppingPurpose: string;
  interestCategories: string[];
  headcount: number;
  budgetMin: number;
  budgetMax?: number; // Response에만 포함될 수 있음
}

/** 동기화 모드: FOLLOW(개인), FREE(호스트). null 불가. */
export type SyncMode = 'FOLLOW' | 'FREE';

export interface CreateRoomRequest {
  roomName: string;
  targetBudget: number;
  roomMeta: RoomMeta;
}

export interface CreateRoomResponse {
  roomId: number;
  hostId: number;
  roomName: string;
  inviteCode: string;
  roomStatus: string;
  targetBudget: number;
  hostCurrentUrl: string | null;
  roomMeta: RoomMeta;
}
