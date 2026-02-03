import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getChatMessages, sendChatMessage } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import { realtimeConfig } from '@/shared/config/realtime';
import UserAvatar from '@/shared/ui/UserAvatar';
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
import './MobilePanels.css';

interface MobileChatPanelProps {
  roomId?: string;
}

const MobileChatPanel: React.FC<MobileChatPanelProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const { user } = useAuthStore();

  const currentMemberId = useMemo(() => {
    const storedMemberId = sessionStorage.getItem('memberId');
    if (storedMemberId) {
      const parsed = Number(storedMemberId);
      if (!Number.isNaN(parsed)) return parsed;
    }
    if (!user?.id) return null;
    const currentParticipant = participants.find((p) => p.userId === user.id || p.memberId === user.id);
    return currentParticipant?.memberId ?? null;
  }, [participants, user]);

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomMembers(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }, [roomId]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const response = await getChatMessages(Number(roomId), 0, 50);
      setMessages([...response.messages].reverse());
    } catch (error) {
      console.error('Failed to load chat messages:', error);
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
      sessionStorage.getItem('accessToken') ?? sessionStorage.getItem('access_token') ?? undefined;
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
              console.error('Failed to parse chat message event:', err);
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
              console.error('Failed to parse chat edited event:', err);
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
              console.error('Failed to parse chat deleted event:', err);
            }
          }),
        );
      })
      .catch((err) => {
        console.error('Failed to connect chat websocket:', err);
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

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId || !input.trim()) {
      return;
    }
    const content = input.trim();
    try {
      if (realtimeConnected && realtimeClientRef.current) {
        publishMessage(realtimeClientRef.current, appRoomsChat(roomId), { content });
      } else {
        const newMessage = await sendChatMessage(Number(roomId), { content });
        upsertMessage(newMessage);
      }
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getParticipant = (senderMemberId: number): RoomMember | undefined =>
    participants.find((p) => p.memberId === senderMemberId);

  const participantsByJoinOrder = useMemo(
    () => [...participants].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()),
    [participants],
  );

  const getColorKeyByMemberId = (memberId: number): number => {
    const index = participantsByJoinOrder.findIndex((p) => p.memberId === memberId);
    return index >= 0 ? index : memberId;
  };

  const isMyMessage = (senderMemberId: number, senderName: string): boolean => {
    if (currentMemberId !== null) {
      return senderMemberId === currentMemberId;
    }
    const storedMemberId = sessionStorage.getItem('memberId');
    if (storedMemberId) {
      const parsed = Number(storedMemberId);
      if (!Number.isNaN(parsed) && parsed === senderMemberId) {
        return true;
      }
    }
    return Boolean(user?.nickname && user.nickname === senderName);
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

  const formatTime = (dateString: string): string =>
    new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
      .format(new Date(dateString))
      .replace(' ', '');

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">실시간 메시지</div>
        {loading ? (
          <div className="mobile-panel-empty">불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="mobile-panel-empty">채팅 메세지가 없습니다.<br />채팅을 시작해 보세요!</div>
        ) : (
          <div className="mobile-panel-chat-list" ref={listRef}>
            {messages.map((message, index) => {
              const participant = getParticipant(message.senderMemberId);
              const senderName = participant?.nickname || `User ${message.senderMemberId}`;
              const isMe = isMyMessage(message.senderMemberId, senderName);
              const next = messages[index + 1];
              const showTimestamp =
                !next ||
                next.senderMemberId !== message.senderMemberId ||
                !isSameMinute(message.createdAt, next.createdAt);

              return (
                <div
                  key={message.chatId}
                  className={`mobile-panel-chat-item ${isMe ? 'is-me' : 'is-other'}`}
                >
                  {!isMe ? (
                    <div className="mobile-panel-chat-other-row">
                      <UserAvatar
                        name={senderName}
                        colorKey={getColorKeyByMemberId(message.senderMemberId)}
                        size="sm"
                        className="mobile-panel-chat-avatar"
                      />
                      <div className="mobile-panel-chat-body">
                        <span className="mobile-panel-chat-name">{senderName}</span>
                        <div className="mobile-panel-chat-line">
                          <span className="mobile-panel-chat-content">{message.content}</span>
                          <span
                            className={`mobile-panel-chat-meta ${showTimestamp ? '' : 'is-hidden'}`}
                          >
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mobile-panel-chat-line">
                      <span className="mobile-panel-chat-content">{message.content}</span>
                      <span className={`mobile-panel-chat-meta ${showTimestamp ? '' : 'is-hidden'}`}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <form className="mobile-panel-chat-form" onSubmit={handleSubmit}>
          <input
            className="mobile-panel-chat-input"
            type="text"
            value={input}
            placeholder="메시지 입력"
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" className="mobile-panel-chat-send">
            <i className="ri-send-plane-line" aria-hidden="true"></i>
          </button>
        </form>
      </div>
    </section>
  );
};

export default MobileChatPanel;

