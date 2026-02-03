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

// 투표 웹소켓
// 구독용: 서버에서 이벤트를 받을 주소
export const topicVoteCreated = (roomId: string | number) =>
  `/topic/rooms/${roomId}/votes/created`;

export const topicVoteParticipated = (roomId: string | number) =>
  `/topic/rooms/${roomId}/votes/participated`;

export const topicVoteClosed = (roomId: string | number) =>
  `/topic/rooms/${roomId}/votes/closed`;

// 정산 웹소켓
// 구독용: 서버에서 정산 변경 이벤트를 받을 주소
export const topicRoomsSettlements = (roomId: string | number) =>
  `/topic/rooms/${roomId}/settlements`;

// 발행용: 서버로 메시지를 보낼 주소
export const appVoteCreate = (roomId: string | number) =>
  `/app/rooms/${roomId}/votes/create`;

export const appVoteParticipate = (roomId: string | number, voteId: number) =>
  `/app/rooms/${roomId}/votes/${voteId}/participate`;

export const appVoteClose = (roomId: string | number, voteId: number) =>
  `/app/rooms/${roomId}/votes/${voteId}/close`;

// 공유 커서 웹소켓
// 구독용: 다른 사용자 커서 위치 수신
export const topicRoomsCursor = (roomId: string | number) =>
  `/topic/rooms/${roomId}/cursor`;

// 발행용: 내 커서 위치 전송
export const appRoomsCursor = (roomId: string | number) =>
  `/app/rooms/${roomId}/cursor`;
