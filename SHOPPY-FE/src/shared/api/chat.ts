// import { apiDelete, apiGet, apiPatch, apiPost } from './utils';
import type { ChatMessage } from './types';
import { mockChatMessages, createMockChatMessage } from './mock/data';

// ===== MOCK MODE (백엔드 서버 연결 시 아래 주석 해제하고 MOCK 코드 삭제) =====
export const getChats = (_roomId: number, _offset = 0, _limit = 50) =>
  Promise.resolve([...mockChatMessages]);

export const sendChat = (_roomId: number, payload: { message: string }) => {
  const newMessage = createMockChatMessage(99, '나', payload.message);
  mockChatMessages.push(newMessage);
  return Promise.resolve(newMessage);
};

export const editChat = (
  _roomId: number,
  chatMessageId: number,
  payload: { message: string },
) => {
  const msg = mockChatMessages.find((m) => m.chatMessageId === chatMessageId);
  if (msg) msg.message = payload.message;
  return Promise.resolve(msg as ChatMessage);
};

export const addReaction = (
  _roomId: number,
  _chatMessageId: number,
  _payload: { emoji: string },
) => Promise.resolve();

export const removeReaction = (_roomId: number, _chatMessageId: number, _emoji: string) =>
  Promise.resolve();

export const updateReadCursor = (_roomId: number, _payload: { lastReadMessageId: number }) =>
  Promise.resolve();

// ===== 원본 코드 (백엔드 연결 시 주석 해제) =====
// export const getChats = (roomId: number, offset = 0, limit = 50) =>
//   apiGet<ChatMessage[]>(`/rooms/${roomId}/chats`, { offset, limit });

// export const sendChat = (roomId: number, payload: { message: string }) =>
//   apiPost<ChatMessage>(`/rooms/${roomId}/chats`, payload);

// export const editChat = (
//   roomId: number,
//   chatMessageId: number,
//   payload: { message: string },
// ) => apiPatch<ChatMessage>(`/rooms/${roomId}/chats/${chatMessageId}`, payload);

// export const addReaction = (
//   roomId: number,
//   chatMessageId: number,
//   payload: { emoji: string },
// ) => apiPost<void>(`/rooms/${roomId}/chats/${chatMessageId}/reactions`, payload);

// export const removeReaction = (roomId: number, chatMessageId: number, emoji: string) =>
//   apiDelete<void>(`/rooms/${roomId}/chats/${chatMessageId}/reactions`, { emoji });

// export const updateReadCursor = (roomId: number, payload: { lastReadMessageId: number }) =>
//   apiPatch<void>(`/rooms/${roomId}/chat-read-cursor`, payload);
