import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoom } from '../../../features/room/model/useCreateRoom';
import { useJoinRoom } from '../../../features/room/model/useJoinRoom';
import type {
  DesktopRoomModalProps,
  RoomModalTab,
  CreateRoomFormData,
  JoinRoomFormData,
} from '../../../entities/room/types/desktopRoomModal.types';
import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import './RoomModal.css';

const RoomModal: React.FC<DesktopRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { run: createRoom } = useCreateRoom();
  const { run: joinRoom } = useJoinRoom();
  const [activeTab, setActiveTab] = useState<RoomModalTab>('create');
  const [createFormData, setCreateFormData] = useState<CreateRoomFormData>({
    title: '',
    purpose: '',
    category: '',
    participants: 0,
    targetBudget: '',
    minBudget: 0,
    mode: 'personal',
  });
  const [joinFormData, setJoinFormData] = useState<JoinRoomFormData>({
    nickname: '',
    entryLink: '',
  });

  if (!isOpen) return null;

  const parseBudget = (budgetStr: string): number => {
    const cleaned = budgetStr.replace(/,/g, '').trim();
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const parseRoomCode = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return '';
    }
    try {
      const url = new URL(trimmed);
      const codeFromQuery =
        url.searchParams.get('code') ?? url.searchParams.get('roomCode');
      if (codeFromQuery) {
        return codeFromQuery;
      }
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] ?? trimmed;
    } catch {
      return trimmed;
    }
  };

  const handleCreateSubmit = async () => {
    const roomName = createFormData.title.trim();
    const targetBudget = parseBudget(createFormData.targetBudget);
    const syncMode = createFormData.mode === 'host' ? 'FOLLOW' : 'INDEPENDENT';
    const category = createFormData.category.trim();

    const payload = {
      roomName,
      targetBudget,
      syncMode,
      roomMeta: {
        shoppingPurpose: createFormData.purpose.trim(),
        interestCategories: category ? [category] : [],
        headcount: createFormData.participants,
        budgetMin: createFormData.minBudget,
      },
    };

    const room = await createRoom(payload);
    navigate(`/room?room_id=${room.roomId}`);
  };

  const handleJoinSubmit = async () => {
    const roomCode = parseRoomCode(joinFormData.entryLink);
    const nickname = joinFormData.nickname.trim();
    if (!roomCode || !nickname) {
      return;
    }

    const { roomId } = await joinRoom({ roomCode, nickname });
    navigate(`/room?room_id=${roomId}&nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="room-modal-header">
          <div className="room-modal-tabs">
            <button
              className={`room-modal-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              방 생성하기
            </button>
            <button
              className={`room-modal-tab ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              방 참여하기
            </button>
          </div>
          <button className="room-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="room-modal-content">
          {activeTab === 'create' ? (
            <CreateRoomForm
              formData={createFormData}
              onChange={setCreateFormData}
              onSubmit={handleCreateSubmit}
            />
          ) : (
            <JoinRoomForm
              formData={joinFormData}
              onChange={setJoinFormData}
              onSubmit={handleJoinSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
