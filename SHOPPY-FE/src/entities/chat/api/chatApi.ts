import axios from 'axios';
import type {
  ChatMessage,
  ChatMessagesResponse,
  SendChatMessageRequest,
  UpdateChatMessageRequest,
} from '../types/chat.types';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
  const response = await axios.get<ApiResponse<ChatMessagesResponse>>(
    `${API_BASE_URL}/api/rooms/${roomId}/chat`,
    {
      params: {
        page,
        size,
      },
    },
  );
  return response.data.data;
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
  const response = await axios.post<ApiResponse<ChatMessage>>(
    `${API_BASE_URL}/api/rooms/${roomId}/chat`,
    payload,
  );
  return response.data.data;
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
  const response = await axios.patch<ApiResponse<ChatMessage>>(
    `${API_BASE_URL}/api/rooms/${roomId}/chat/${chatId}`,
    payload,
  );
  return response.data.data;
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
  await axios.delete<ApiResponse<null>>(
    `${API_BASE_URL}/api/rooms/${roomId}/chat/${chatId}`,
  );
};
