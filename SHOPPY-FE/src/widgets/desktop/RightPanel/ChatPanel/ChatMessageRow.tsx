import React, { useState } from 'react';
import type { ChatMessage } from '@/entities/chat/types/chat.types';
import { updateChatMessage, deleteChatMessage } from '@/entities/chat/api/chatApi';

interface ChatMessageRowProps {
  message: ChatMessage;
  timestamp: string;
  showTimestamp?: boolean;
  onMessageUpdated?: (message: ChatMessage) => void;
  onMessageDeleted?: (chatId: number) => void;
}

const ChatMessageRow: React.FC<ChatMessageRowProps> = ({
  message,
  timestamp,
  showTimestamp = true,
  onMessageUpdated,
  onMessageDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggleMenu = () => {
    setIsActionsOpen(true);
    setIsMenuOpen((prev) => !prev);
  };

  const handleStartEdit = () => {
    setIsMenuOpen(false);
    setIsActionsOpen(false);
    setIsEditing(true);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent(message.content);
    setIsActionsOpen(false);
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
      setIsActionsOpen(false);
    } catch (error) {
      console.error('Failed to update chat message:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 메시지를 삭제할까요?')) return;
    try {
      setDeleting(true);
      await deleteChatMessage(message.roomId, message.chatId);
      onMessageDeleted?.(message.chatId);
      setIsMenuOpen(false);
      setIsActionsOpen(false);
    } catch (error) {
      console.error('Failed to delete chat message:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleBubbleClick = () => {
    if (isEditing) return;
    setIsActionsOpen((prev) => !prev);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`chat-message-row ${isActionsOpen || isMenuOpen ? 'show-actions' : ''}`}>
      <div className="chat-message-line">
        <div
          className={`chat-message-bubble ${isEditing ? 'chat-message-bubble--editing' : ''}`}
          onClick={handleBubbleClick}
        >
          {isEditing ? (
            <input
              className="chat-message-edit-input"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
            />
          ) : (
            <span className="chat-message-text">{message.content}</span>
          )}
        </div>
        {!isEditing && (
          <div className={`chat-message-time ${showTimestamp ? '' : 'is-hidden'}`}>{timestamp}</div>
        )}
      </div>

      {!isEditing && (
        <div className="chat-message-actions">
          <button
            type="button"
            className="chat-message-action-button"
            aria-label="이모지 추가"
            onClick={(event) => event.stopPropagation()}
          >
            <i className="ri-emotion-happy-line"></i>
          </button>
          <button
            type="button"
            className={`chat-message-action-button ${
              isMenuOpen ? 'chat-message-action-button--active' : ''
            }`}
            aria-label="더보기"
            onClick={(event) => {
              event.stopPropagation();
              handleToggleMenu();
            }}
          >
            <i className="ri-more-fill"></i>
          </button>
        </div>
      )}

      {isMenuOpen && !isEditing && (
        <div className="chat-message-more-menu">
          <button type="button" className="chat-message-more-menu-item" onClick={handleStartEdit}>
            <i className="ri-pencil-line"></i>
            <span>수정</span>
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
