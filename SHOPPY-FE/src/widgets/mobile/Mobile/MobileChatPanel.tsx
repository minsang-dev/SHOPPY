import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
      console.error('메시지 전송 실패:', error);
    }
  };

  const getParticipant = (senderMemberId: number): RoomMember | undefined =>
    participants.find((p) => p.memberId === senderMemberId);

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">실시간 메시지</div>
        {loading ? (
          <div className="mobile-panel-empty">불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="mobile-panel-empty">아직 메시지가 없습니다.</div>
        ) : (
          <div className="mobile-panel-chat-list" ref={listRef}>
            {messages.map((message) => {
              const participant = getParticipant(message.senderMemberId);
              const senderName = participant?.nickname || `사용자 ${message.senderMemberId}`;
              const isMe =
                currentMemberId !== null && message.senderMemberId === currentMemberId;
              return (
                <div key={message.chatId} className="mobile-panel-chat-item">
                  <span className="mobile-panel-chat-name">
                    {senderName}
                    {isMe ? ' (나)' : ''} ·{' '}
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="mobile-panel-chat-content">{message.content}</span>
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
            전송
          </button>
        </form>
      </div>
    </section>
  );
};

export default MobileChatPanel;
