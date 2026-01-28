/**
 * 채팅 메시지 타입
 */
export interface ChatMessage {
  chatId: number;
  roomId: number;
  senderMemberId: number;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  editedAt: string | null;
}

/**
 * 채팅 메시지 목록 조회 응답 타입
 */
export interface ChatMessagesResponse {
  messages: ChatMessage[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

/**
 * 채팅 메시지 전송 요청 타입
 */
export interface SendChatMessageRequest {
  content: string;
}

/**
 * 채팅 메시지 수정 요청 타입
 */
export interface UpdateChatMessageRequest {
  content: string;
}
