import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import { useChatRealtimeContext } from '@/features/chat/model/useChatRealtime';
import UserAvatar from '@/shared/ui/UserAvatar';
import ChatMessageRow from './ChatMessageRow';
import './ChatPanel.css';

const ChatPanel: React.FC = () => {
  const {
    messages,
    setMessages,
    upsertMessage,
    realtimeConnected,
    loading,
    roomId,
    publishChat,
  } = useChatRealtimeContext();
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const currentMemberId = useMemo(() => {
    if (!user?.id) return null;
    const currentParticipant = participants.find((p) => p.userId === user.id);
    return currentParticipant?.memberId ?? null;
  }, [participants, user]);

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomMembers(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('참여자 목록 조회 실패:', error);
    }
  }, [roomId]);

  useEffect(() => {
    queueMicrotask(() => {
      loadParticipants();
    });
  }, [loadParticipants]);

  const handleSendMessage = async () => {
    if (!roomId || !inputContent.trim()) return;
    const content = inputContent.trim();

    try {
      if (realtimeConnected) {
        publishChat(content);
      } else {
        const newMessage = await sendChatMessage(Number(roomId), { content });
        upsertMessage(newMessage);
      }
      setInputContent('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getParticipant = (senderMemberId: number): RoomMember | undefined => {
    return participants.find((p) => p.memberId === senderMemberId);
  };

  /** 입장 순서(joinedAt) 기준으로 정렬된 참여자 목록 - 색상 인덱스 계산용 */
  const participantsByJoinOrder = useMemo(
    () => [...participants].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()),
    [participants],
  );

  /** memberId로 입장 순서 인덱스를 찾아 색상 키로 사용 */
  const getColorKeyByMemberId = (memberId: number): number => {
    const index = participantsByJoinOrder.findIndex((p) => p.memberId === memberId);
    return index >= 0 ? index : memberId;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}시 ${minutes}분`;
  };

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

  const today = new Date();
  const todayString = formatDate(today.toISOString());

  const messageGroups = useMemo(() => {
    const groups: {
      id: string;
      senderMemberId: number;
      createdAt: string;
      messages: ChatMessage[];
    }[] = [];

    let currentGroup: {
      id: string;
      senderMemberId: number;
      createdAt: string;
      messages: ChatMessage[];
    } | null = null;

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

  const handleMessageUpdated = (updated: ChatMessage) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.chatId === updated.chatId ? updated : msg)),
    );
  };

  const handleMessageDeleted = (chatId: number) => {
    setMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
  };

  return (
    <div className="panel-content chat-panel">
      <div className="chat-date-header">{todayString}</div>

      <div className="chat-messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-loading">로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">채팅 메시지가 없습니다.</div>
        ) : (
          messageGroups.map((group) => {
            const participant = getParticipant(group.senderMemberId);
            const senderName = participant?.nickname || `사용자 ${group.senderMemberId}`;
            const isCurrentUser =
              currentMemberId !== null && group.senderMemberId === currentMemberId;

            return (
              <div key={group.id} className="chat-message-group">
                <UserAvatar
                  name={senderName}
                  colorKey={getColorKeyByMemberId(group.senderMemberId)}
                  size="sm"
                  className="chat-avatar"
                />
                <div className="chat-message-content">
                  <div className="chat-message-header">
                    <span className="chat-sender-name">
                      {senderName}
                      {isCurrentUser && ' (나)'}
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

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputContent}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요.."
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
