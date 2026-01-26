import { apiDelete, apiGet, apiPatch, apiPost } from './utils';
import type { ChatMessage } from './types';

export const getChats = (roomId: number, offset = 0, limit = 50) =>
  apiGet<ChatMessage[]>(`/rooms/${roomId}/chats`, { offset, limit });

export const sendChat = (roomId: number, payload: { message: string }) =>
  apiPost<ChatMessage>(`/rooms/${roomId}/chats`, payload);

export const editChat = (
  roomId: number,
  chatMessageId: number,
  payload: { message: string },
) => apiPatch<ChatMessage>(`/rooms/${roomId}/chats/${chatMessageId}`, payload);

export const addReaction = (
  roomId: number,
  chatMessageId: number,
  payload: { emoji: string },
) => apiPost<void>(`/rooms/${roomId}/chats/${chatMessageId}/reactions`, payload);

export const removeReaction = (roomId: number, chatMessageId: number, emoji: string) =>
  apiDelete<void>(`/rooms/${roomId}/chats/${chatMessageId}/reactions`, { emoji });

export const updateReadCursor = (roomId: number, payload: { lastReadMessageId: number }) =>
  apiPatch<void>(`/rooms/${roomId}/chat-read-cursor`, payload);
