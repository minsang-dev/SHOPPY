import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages, sendChatMessage } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import './ChatPanel.css';

/**
 * 채팅 패널 컴포넌트
 */
const ChatPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // 현재 사용자의 memberId 찾기
  const currentMemberId = useMemo(() => {
    if (!user?.userId) return null;
    const currentParticipant = participants.find((p) => p.userId === user.userId);
    return currentParticipant?.memberId || null;
  }, [participants, user]);

  // 참여자 목록 조회
  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomMembers(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('참여자 목록 조회 실패:', error);
    }
  }, [roomId]);

  // 채팅 메시지 조회
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const response = await getChatMessages(Number(roomId), 0, 50);
      setMessages(response.messages);
    } catch (error) {
      console.error('채팅 메시지 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadParticipants();
    loadMessages();
  }, [loadParticipants, loadMessages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!roomId || !inputContent.trim()) return;

    try {
      const newMessage = await sendChatMessage(Number(roomId), {
        content: inputContent.trim(),
      });
      setMessages((prev) => [...prev, newMessage]);
      setInputContent('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // Enter 키 처리 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // textarea 높이 자동 조절
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`; // max-height: 6rem (96px)
  };

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 참여자 정보 가져오기
  const getParticipant = (senderMemberId: number): RoomMember | undefined => {
    return participants.find((p) => p.memberId === senderMemberId);
  };

  // 날짜 포맷팅 (2026년 1월 28일 수요일)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}`;
  };

  // 시간 포맷팅 (16시 45분)
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}시 ${minutes}분`;
  };

  // 아바타 색상 생성 (이름 기반)
  const getAvatarColor = (name: string): string => {
    const colors = [
      '#6366f1', // indigo
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#14b8a6', // teal
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 이름의 첫 글자 추출
  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  // 오늘 날짜 표시
  const today = new Date();
  const todayString = formatDate(today.toISOString());

  return (
    <div className="panel-content chat-panel">
      {/* 날짜 헤더 */}
      <div className="chat-date-header">{todayString}</div>

      {/* 채팅 메시지 리스트 */}
      <div className="chat-messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-loading">로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">채팅 메시지가 없습니다.</div>
        ) : (
          messages.map((message) => {
            if (message.isDeleted) return null;

            const participant = getParticipant(message.senderMemberId);
            const senderName = participant?.nickname || `사용자 ${message.senderMemberId}`;
            const isCurrentUser = currentMemberId !== null && message.senderMemberId === currentMemberId;

            return (
              <div key={message.chatId} className="chat-message">
                <div
                  className="chat-avatar"
                  style={{ backgroundColor: getAvatarColor(senderName) }}
                >
                  {getInitial(senderName)}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-header">
                    <span className="chat-sender-name">
                      {senderName}
                      {isCurrentUser && '(나)'}
                    </span>
                    <span className="chat-timestamp">{formatTime(message.createdAt)}</span>
                  </div>
                  <div className="chat-message-text">{message.content}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputContent}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <button
          className="chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputContent.trim()}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 10L18 2L12 18L10 11L2 10Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
