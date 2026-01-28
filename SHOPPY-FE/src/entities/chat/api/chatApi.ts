import { apiRequest } from '@/shared/api/http';
import type {
  ChatMessage,
  ChatMessagesResponse,
  SendChatMessageRequest,
  UpdateChatMessageRequest,
} from '../types/chat.types';

/**
 * 채팅 메시지 목록 조회 API
 * @param roomId 방 ID
 * @param page 페이지 번호 (기본값: 0)
 * @param size 페이지 크기 (기본값: 50)
 * @returns 채팅 메시지 목록 및 페이지네이션 정보
 */
export const getChatMessages = async (
  roomId: number,
  page: number = 0,
  size: number = 50,
): Promise<ChatMessagesResponse> => {
  return apiRequest<ChatMessagesResponse>({
    method: 'GET',
    url: `/rooms/${roomId}/chat`,
    params: { page, size },
  });
};

/**
 * 채팅 메시지 전송 API
 * @param roomId 방 ID
 * @param payload 메시지 내용
 * @returns 전송된 채팅 메시지
 */
export const sendChatMessage = async (
  roomId: number,
  payload: SendChatMessageRequest,
): Promise<ChatMessage> => {
  return apiRequest<ChatMessage>({
    method: 'POST',
    url: `/rooms/${roomId}/chat`,
    data: payload,
  });
};

/**
 * 채팅 메시지 수정 API
 * @param roomId 방 ID
 * @param chatId 채팅 메시지 ID
 * @param payload 수정할 메시지 내용
 * @returns 수정된 채팅 메시지
 */
export const updateChatMessage = async (
  roomId: number,
  chatId: number,
  payload: UpdateChatMessageRequest,
): Promise<ChatMessage> => {
  return apiRequest<ChatMessage>({
    method: 'PATCH',
    url: `/rooms/${roomId}/chat/${chatId}`,
    data: payload,
  });
};

/**
 * 채팅 메시지 삭제 API
 * @param roomId 방 ID
 * @param chatId 채팅 메시지 ID
 */
export const deleteChatMessage = async (
  roomId: number,
  chatId: number,
): Promise<void> => {
  await apiRequest<null>({
    method: 'DELETE',
    url: `/rooms/${roomId}/chat/${chatId}`,
  });
};
