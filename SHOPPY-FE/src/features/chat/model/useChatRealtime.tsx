import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages } from '@/entities/chat/api/chatApi';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { getRoomMembers } from '@/entities/room/api/room';
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
import type { RightPanelType } from '@/entities/room/types/desktopVideoChat.types';
import { useChatNotificationStore } from './useChatNotificationStore';

interface ChatRealtimeContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  upsertMessage: (incoming: ChatMessage) => void;
  realtimeConnected: boolean;
  loading: boolean;
  loadMessages: () => Promise<void>;
  roomId: string | undefined;
  publishChat: (content: string) => void;
}

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | null>(null);

const resolveToken = () =>
  sessionStorage.getItem('accessToken') ??
  sessionStorage.getItem('access_token') ??
  undefined;

interface ChatRealtimeProviderProps {
  activePanel: RightPanelType;
  children: ReactNode;
}

export const ChatRealtimeProvider: React.FC<ChatRealtimeProviderProps> = ({
  activePanel,
  children,
}) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<{ memberId: number; userId: number | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const activePanelRef = useRef(activePanel);
  const { increment, reset } = useChatNotificationStore();

  activePanelRef.current = activePanel;

  const currentMemberId = useMemo(() => {
    if (!user?.id) return null;
    const p = participants.find((m) => m.userId === user.id);
    return p?.memberId ?? null;
  }, [participants, user?.id]);

  const currentMemberIdRef = useRef(currentMemberId);
  currentMemberIdRef.current = currentMemberId;

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomMembers(roomId);
      setParticipants(data.map((m) => ({ memberId: m.memberId, userId: m.userId })));
    } catch (err) {
      console.error('참여자 목록 조회 실패:', err);
    }
  }, [roomId]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const response = await getChatMessages(Number(roomId), 0, 50);
      setMessages([...response.messages].reverse());
    } catch (err) {
      console.error('채팅 메시지 조회 실패:', err);
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
    if (activePanel === 'chat') {
      reset();
    }
  }, [activePanel, reset]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset, roomId]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    realtimeClientRef.current = client;
    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        setRealtimeConnected(true);
        subscriptions.push(
          subscribeTopic(client, topicRoomsChat(roomId), (body) => {
            try {
              const payload = JSON.parse(body) as ChatMessage;
              if (payload?.chatId) {
                const myId = currentMemberIdRef.current;
                const isFromSelf = myId !== null && payload.senderMemberId === myId;
                const isViewingChat = activePanelRef.current === 'chat';
                if (!isFromSelf && !isViewingChat) {
                  increment();
                }
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
  }, [roomId, upsertMessage, increment]);

  const publishChat = useCallback(
    (content: string) => {
      if (!roomId || !realtimeClientRef.current) return;
      publishMessage(realtimeClientRef.current, appRoomsChat(roomId), { content });
    },
    [roomId],
  );

  const value = useMemo<ChatRealtimeContextValue>(
    () => ({
      messages,
      setMessages,
      upsertMessage,
      realtimeConnected,
      loading,
      loadMessages,
      roomId,
      publishChat,
    }),
    [messages, upsertMessage, realtimeConnected, loading, loadMessages, roomId, publishChat],
  );

  return (
    <ChatRealtimeContext.Provider value={value}>{children}</ChatRealtimeContext.Provider>
  );
};

// Context 소비용 훅 - Provider와 함께 사용되므로 동일 파일에서 export
// eslint-disable-next-line react-refresh/only-export-components
export const useChatRealtimeContext = (): ChatRealtimeContextValue => {
  const ctx = useContext(ChatRealtimeContext);
  if (!ctx) {
    throw new Error('useChatRealtimeContext must be used within ChatRealtimeProvider');
  }
  return ctx;
};
