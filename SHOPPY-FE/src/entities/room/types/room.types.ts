export interface JoinRoomRequest {
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

export interface RoomResponse {
  roomId: number;
  hostId: number;
  roomName: string;
  inviteCode: string;
  roomStatus: string;
  targetBudget: string | number | null;
  syncMode: string;
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
}
