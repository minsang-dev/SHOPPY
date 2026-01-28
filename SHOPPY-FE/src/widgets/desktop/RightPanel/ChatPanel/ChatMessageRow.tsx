import React, { useState } from 'react';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { updateChatMessage, deleteChatMessage } from '@/entities/chat/api/chatApi';

interface ChatMessageRowProps {
  message: ChatMessage;
  onMessageUpdated?: (message: ChatMessage) => void;
  onMessageDeleted?: (chatId: number) => void;
}

/**
 * - 호버 시 회색 배경
 * - 더보기 버튼 클릭 시 파란색 활성화 + 편집/삭제 메뉴 표시
 * - 편집 클릭 시 메시지 수정 UI 노출
 */
const ChatMessageRow: React.FC<ChatMessageRowProps> = ({ message, onMessageUpdated, onMessageDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleStartEdit = () => {
    setIsMenuOpen(false);
    setIsEditing(true);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim()) return;
    try {
      setSaving(true);
      const updated = await updateChatMessage(message.roomId, message.chatId, {
        content: editingContent.trim(),
      });
      onMessageUpdated?.(updated);
      setIsEditing(false);
    } catch (error) {
      // TODO: 에러 토스트 처리 가능
      // eslint-disable-next-line no-console
      console.error('채팅 메시지 수정 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 메시지를 삭제하시겠습니까?')) return;
    try {
      setDeleting(true);
      await deleteChatMessage(message.roomId, message.chatId);
      onMessageDeleted?.(message.chatId);
      setIsMenuOpen(false);
    } catch (error) {
      // TODO: 에러 토스트 처리 가능
      // eslint-disable-next-line no-console
      console.error('채팅 메시지 삭제 실패:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="chat-message-row">
      <div className={`chat-message-bubble ${isEditing ? 'chat-message-bubble--editing' : ''}`}>
        {isEditing ? (
          <input
            className="chat-message-edit-input"
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
          />
        ) : (
          <span className="chat-message-text">{message.content}</span>
        )}

        {!isEditing && (
          <div className="chat-message-actions">
            <button
              type="button"
              className="chat-message-action-button"
              aria-label="이모티콘 추가"
            >
              <i className="ri-emotion-happy-line"></i>
            </button>
            <button
              type="button"
              className={`chat-message-action-button ${
                isMenuOpen ? 'chat-message-action-button--active' : ''
              }`}
              aria-label="더보기"
              onClick={handleToggleMenu}
            >
              <i className="ri-more-fill"></i>
            </button>
          </div>
        )}
      </div>

      {isMenuOpen && !isEditing && (
        <div className="chat-message-more-menu">
          <button
            type="button"
            className="chat-message-more-menu-item"
            onClick={handleStartEdit}
          >
            <i className="ri-pencil-line"></i>
            <span>편집</span>
          </button>
          <button
            type="button"
            className="chat-message-more-menu-item chat-message-more-menu-item--danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            <i className="ri-delete-bin-line"></i>
            <span>삭제</span>
          </button>
        </div>
      )}

      {isEditing && (
        <div className="chat-message-edit-actions">
          <button
            type="button"
            className="chat-message-edit-button chat-message-edit-button--primary"
            onClick={handleSaveEdit}
            disabled={saving || !editingContent.trim()}
          >
            저장
          </button>
          <button
            type="button"
            className="chat-message-edit-button chat-message-edit-button--secondary"
            onClick={handleCancelEdit}
            disabled={saving}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMessageRow;


