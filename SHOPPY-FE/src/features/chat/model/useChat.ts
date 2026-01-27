import { useEffect, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { getChats, sendChat } from '../../../shared/api/chat';
import type { ChatMessage } from '../../../shared/api/types';

export const useChat = (roomId: number | string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const fetchChats = async (offset = 0, limit = 50) => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getChats(Number(roomId), offset, limit);
      setMessages(res);
    } catch (e) {
      setError(normalizeApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const send = async (message: string) => {
    if (!roomId) return;
    const res = await sendChat(Number(roomId), { message });
    setMessages((prev) => [...prev, res]);
  };

  useEffect(() => {
    fetchChats();
  }, [roomId]);

  return { messages, loading, error, fetchChats, send };
};
