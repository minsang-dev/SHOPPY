import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages, sendChatMessage } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import { realtimeConfig } from '@/shared/config/realtime';
import {
  appRoomsChat,
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  publishMessage,
  subscribeTopic,
  topicRoomsChat,
  topicRoomsChatDeleted,
  topicRoomsChatEdited,
} from '@/shared/lib/realtime';
import ChatMessageRow from './ChatMessageRow';
import './ChatPanel.css';

const ChatPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
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

  const upsertMessage = useCallback((incoming: ChatMessage) => {
    setMessages((prev) => {
      const exists = prev.find((msg) => msg.chatId === incoming.chatId);
      if (exists) {
        return prev.map((msg) => (msg.chatId === incoming.chatId ? incoming : msg));
      }
      return [...prev, incoming];
    });
  }, []);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token =
      localStorage.getItem('accessToken') ??
      localStorage.getItem('access_token') ??
      undefined;
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    realtimeClientRef.current = client;
    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) {
          return;
        }
        setRealtimeConnected(true);
        subscriptions.push(
          subscribeTopic(client, topicRoomsChat(roomId), (body) => {
            try {
              const payload = JSON.parse(body) as ChatMessage;
              if (payload?.chatId) {
                upsertMessage(payload);
              }
            } catch (err) {
              console.error('채팅 메시지 파싱 실패:', err);
            }
          }),
        );
        subscriptions.push(
          subscribeTopic(client, topicRoomsChatEdited(roomId), (body) => {
            try {
              const payload = JSON.parse(body) as {
                chatId: number;
                content: string;
                isEdited: boolean;
                editedAt: string | null;
              };
              if (payload?.chatId) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.chatId === payload.chatId
                      ? {
                          ...msg,
                          content: payload.content ?? msg.content,
                          isEdited: payload.isEdited ?? true,
                          editedAt: payload.editedAt ?? msg.editedAt,
                        }
                      : msg,
                  ),
                );
              }
            } catch (err) {
              console.error('채팅 수정 이벤트 파싱 실패:', err);
            }
          }),
        );
        subscriptions.push(
          subscribeTopic(client, topicRoomsChatDeleted(roomId), (body) => {
            try {
              const payload = JSON.parse(body) as { chatId: number };
              if (payload?.chatId) {
                setMessages((prev) => prev.filter((msg) => msg.chatId !== payload.chatId));
              }
            } catch (err) {
              console.error('채팅 삭제 이벤트 파싱 실패:', err);
            }
          }),
        );
      })
      .catch((err) => {
        console.error('채팅 WS 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
      setRealtimeConnected(false);
      void disconnectRealtimeClient(client);
      if (realtimeClientRef.current === client) {
        realtimeClientRef.current = null;
      }
    };
  }, [roomId, upsertMessage]);

  const handleSendMessage = async () => {
    if (!roomId || !inputContent.trim()) return;
    const content = inputContent.trim();

    try {
      if (realtimeConnected && realtimeClientRef.current) {
        publishMessage(realtimeClientRef.current, appRoomsChat(roomId), { content });
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

  const getAvatarGradient = (name: string): string => {
    const gradients = [
      'linear-gradient(135deg, #a855f7, #3b82f6)',
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #a855f7)',
      'linear-gradient(135deg, #7c3aed, #2563eb)',
      'linear-gradient(135deg, #9333ea, #60a5fa)',
      'linear-gradient(135deg, #4f46e5, #a855f7)',
      'linear-gradient(135deg, #2563eb, #8b5cf6)',
      'linear-gradient(135deg, #a855f7, #60a5fa)',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const getInitial = (name: string): string => {
    return name.charAt(0);
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
