import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DesktopRoomModalProps, RoomModalTab, CreateRoomFormData, JoinRoomFormData } from '../../../entities/room/types/desktopRoomModal.types';
import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import './RoomModal.css';

const RoomModal: React.FC<DesktopRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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

  const handleCreateSubmit = () => {
    // TODO: API 호출
    navigate('/room');
  };

  const handleJoinSubmit = () => {
    // TODO: API 호출
    navigate('/room');
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
            ✕
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
