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
  syncMode: string;
  hostCurrentUrl: string | null;
  roomMeta: RoomMeta;
};

export type JoinRoomResponse = {
  memberId: number;
  roomId: number;
  userId: number | null;
  nickname: string;
  role: string;
  status: string;
  isCameraOn: boolean;
  joinedAt: string;
};

export type Member = JoinRoomResponse;

export type ShoppingItem = {
  shoppingItemId: number;
  name: string;
  quantity: number;
  price?: number;
  imageUrl?: string | null;
  checked?: boolean;
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
