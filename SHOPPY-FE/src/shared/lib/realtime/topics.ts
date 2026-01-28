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
