import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages, sendChatMessage } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import ChatMessageRow from './ChatMessageRow';
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
    if (!user?.id) return null;
    const currentParticipant = participants.find((p) => p.userId === user.id);
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

  // 동일 시/분인지 확인하는 함수
  const isSameMinute = (dateString1: string, dateString2: string): boolean => {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate() &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    );
  };

  // 아바타 그라데이션 생성 
  const getAvatarGradient = (name: string): string => {
    const gradients = [
      'linear-gradient(135deg, #a855f7, #3b82f6)', // 밝은 보라 → 파랑
      'linear-gradient(135deg, #6366f1, #8b5cf6)', // 인디고 → 밝은 보라
      'linear-gradient(135deg, #3b82f6, #a855f7)', // 파랑 → 밝은 보라
      'linear-gradient(135deg, #7c3aed, #2563eb)', // 진한 보라 → 진한 파랑
      'linear-gradient(135deg, #9333ea, #60a5fa)', // 보라 → 밝은 파랑
      'linear-gradient(135deg, #4f46e5, #a855f7)', // 진한 인디고 → 밝은 보라
      'linear-gradient(135deg, #2563eb, #8b5cf6)', // 진한 파랑 → 보라
      'linear-gradient(135deg, #a855f7, #60a5fa)', // 밝은 보라 → 밝은 파랑
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // 이름의 첫 글자 추출
  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  // 오늘 날짜 표시
  const today = new Date();
  const todayString = formatDate(today.toISOString());

  // 같은 시/분, 같은 발신자의 메시지를 하나의 그룹으로 묶기
  const messageGroups = useMemo(() => {
    const groups: {
      id: string;
      senderMemberId: number;
      createdAt: string;
      messages: ChatMessage[];
    }[] = [];

    let currentGroup:
      | {
          id: string;
          senderMemberId: number;
          createdAt: string;
          messages: ChatMessage[];
        }
      | null = null;

    messages.forEach((message) => {
      if (message.isDeleted) return;

      if (!currentGroup) {
        currentGroup = {
          id: `${message.senderMemberId}-${message.chatId}`,
          senderMemberId: message.senderMemberId,
          createdAt: message.createdAt,
          messages: [message],
        };
        groups.push(currentGroup);
        return;
      }

      const sameSender = currentGroup.senderMemberId === message.senderMemberId;
      const sameMinute = isSameMinute(currentGroup.createdAt, message.createdAt);

      if (sameSender && sameMinute) {
        currentGroup.messages.push(message);
      } else {
        currentGroup = {
          id: `${message.senderMemberId}-${message.chatId}`,
          senderMemberId: message.senderMemberId,
          createdAt: message.createdAt,
          messages: [message],
        };
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [messages]);

  // 단일 메시지 업데이트 시 상태 반영
  const handleMessageUpdated = (updated: ChatMessage) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.chatId === updated.chatId ? updated : msg)),
    );
  };

  // 메시지 삭제 시 상태에서 제거
  const handleMessageDeleted = (chatId: number) => {
    setMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
  };

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
          messageGroups.map((group) => {
            const participant = getParticipant(group.senderMemberId);
            const senderName = participant?.nickname || `사용자 ${group.senderMemberId}`;
            const isCurrentUser = currentMemberId !== null && group.senderMemberId === currentMemberId;

            return (
              <div key={group.id} className="chat-message-group">
                <div
                  className="chat-avatar"
                  style={{ background: getAvatarGradient(senderName) }}
                >
                  {getInitial(senderName)}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-header">
                    <span className="chat-sender-name">
                      {senderName}
                      {isCurrentUser && '(나)'}
                    </span>
                    <span className="chat-timestamp">{formatTime(group.createdAt)}</span>
                  </div>
                  {group.messages.map((message) => (
                    <ChatMessageRow
                      key={message.chatId}
                      message={message}
                      onMessageUpdated={handleMessageUpdated}
                      onMessageDeleted={handleMessageDeleted}
                    />
                  ))}
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
          <i className="ri-send-plane-line"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
