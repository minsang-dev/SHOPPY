export const topicRoomsMembers = (roomId: string | number) =>
  `/topic/rooms/${roomId}/members`;

export const topicRoomsSyncMode = (roomId: string | number) =>
  `/topic/rooms/${roomId}/sync-mode`;

export const topicRoomsHostUrl = (roomId: string | number) =>
  `/topic/rooms/${roomId}/host-url`;

export const topicRoomsStatus = (roomId: string | number) =>
  `/topic/rooms/${roomId}/status`;

export const topicRoomsChat = (roomId: string | number) =>
  `/topic/rooms/${roomId}/chat`;

export const topicRoomsChatEdited = (roomId: string | number) =>
  `/topic/rooms/${roomId}/chat/edited`;

export const topicRoomsChatDeleted = (roomId: string | number) =>
  `/topic/rooms/${roomId}/chat/deleted`;

export const appRoomsChat = (roomId: string | number) => `/app/rooms/${roomId}/chat`;

// 장바구니 웹소켓
// 구독용: 서버에서 이벤트를 받을 주소
export const topicShoppingAdded = (roomId: string | number) =>
  `/topic/rooms/${roomId}/shopping/added`;

export const topicShoppingUpdated = (roomId: string | number) =>
  `/topic/rooms/${roomId}/shopping/updated`;

export const topicShoppingDeleted = (roomId: string | number) =>
  `/topic/rooms/${roomId}/shopping/deleted`;

// 발행용: 서버로 메시지를 보낼 주소
export const appShoppingAdd = (roomId: string | number) =>
  `/app/rooms/${roomId}/shopping/add`;

export const appShoppingUpdate = (roomId: string | number, itemId: number) =>
  `/app/rooms/${roomId}/shopping/update/${itemId}`;

export const appShoppingDelete = (roomId: string | number) =>
  `/app/rooms/${roomId}/shopping/delete`;
