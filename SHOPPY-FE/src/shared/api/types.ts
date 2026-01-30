export type RoomMeta = {
  shoppingPurpose: string;
  interestCategories: string[];
  headcount: number;
  budgetMin: number;
};

export type Room = {
  roomId: number;
  hostId: number;
  roomName: string;
  inviteCode: string;
  roomStatus: string;
  targetBudget: number;
  hostCurrentUrl: string | null;
  roomMeta: RoomMeta;
};

export type Member = {
  memberId: number;
  roomId: number;
  userId: number | null;
  nickname: string;
  role: string;
  status: string;
  isCameraOn: boolean;
  joinedAt: string;
  syncMode: 'FOLLOW' | 'FREE';
};

// 로그인 유저 방 참여 응답
export type JoinRoomResponse = Member;

// 게스트 방 참여 응답 (accessToken 포함)
export type JoinRoomGuestResponse = {
  member: Member;
  accessToken: string;
};

export type ShoppingItem = {
  shoppingItemId: number;
  name?: string;
  displayName?: string;
  quantity: number;
  price?: number;
  imageUrl?: string | null;
  checked?: boolean;
  isChecked?: boolean;
  purchaseType?: string | null;
};

export type Product = {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
};

export type ProductListResponse = { items: Product[] } | Product[];

export type WebRTCSession = {
  sessionId: string;
  token: string;
  openViduUrl: string;
  maxParticipants: number;
  iceServers: Array<{
    urls: string[];
    username?: string | null;
    credential?: string | null;
  }>;
};

export type WebRTCQualityProfile = {
  name: string;
  width: number;
  height: number;
  maxFps: number;
  maxBitrateKbps: number;
};

export type ChatMessage = {
  chatMessageId: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string;
};
