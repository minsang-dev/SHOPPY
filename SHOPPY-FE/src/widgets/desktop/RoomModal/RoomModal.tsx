import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoom } from '@/features/room/model/useCreateRoom';
import { useJoinRoom } from '@/features/room/model/useJoinRoom';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import type {
  DesktopRoomModalProps,
  RoomModalTab,
  CreateRoomFormData,
  JoinRoomFormData,
} from '@/entities/room/types/desktopRoomModal.types';
import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import './RoomModal.css';

const RoomModal: React.FC<DesktopRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { run: createRoom } = useCreateRoom();
  const { run: joinRoom } = useJoinRoom();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [activeTab, setActiveTab] = useState<RoomModalTab>(isLoggedIn ? 'create' : 'join');
  const [createFormData, setCreateFormData] = useState<CreateRoomFormData>({
    title: '',
    purpose: '',
    category: '',
    participants: 1,
    targetBudget: '',
    minBudget: 1000,
    mode: 'personal',
  });
  const [joinFormData, setJoinFormData] = useState<JoinRoomFormData>({
    nickname: '',
    entryLink: '',
  });

  if (!isOpen) return null;

  const handleCreateSubmit = async () => {
    try {
      // 예산 문자열을 숫자로 변환 (쉼표 제거)
      const parseBudget = (budgetStr: string): number => {
        const cleaned = budgetStr.replace(/,/g, '').trim();
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      const targetBudget = parseBudget(createFormData.targetBudget);
      
      // 카테고리 문자열을 배열로 변환 (쉼표로 구분)
      const interestCategories = createFormData.category
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      // syncMode 변환: personal -> FOLLOW, host -> FREE
      const syncMode = createFormData.mode === 'personal' ? 'FOLLOW' : 'FREE';

      const payload = {
        roomName: createFormData.title,
        targetBudget,
        syncMode,
        roomMeta: {
          shoppingPurpose: createFormData.purpose,
          interestCategories,
          headcount: createFormData.participants,
          budgetMin: createFormData.minBudget,
        },
      };
      console.log('방 생성 요청 payload:', payload);
      const response = await createRoom(payload);

      // 방 생성 성공 시 /rooms/:roomId로 이동
      navigate(`/rooms/${response.roomId}`);
    } catch (error) {
      console.error('방 생성 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  const handleJoinSubmit = async () => {
    try {
      // entryLink에서 roomCode 추출 (URL이면 마지막 부분, 아니면 그대로 사용)
      let roomCode = joinFormData.entryLink.trim();

      // URL 형식인 경우 마지막 경로나 쿼리 파라미터에서 코드 추출
      if (roomCode.includes('/')) {
        const urlParts = roomCode.split('/');
        roomCode = urlParts[urlParts.length - 1];
      }

      // 쿼리 파라미터가 있는 경우 처리
      if (roomCode.includes('?')) {
        roomCode = roomCode.split('?')[0];
      }

      // 로그인 상태에 따라 다른 API 호출
      const response = isLoggedIn
        ? await joinRoom({ roomCode, isLoggedIn: true })
        : await joinRoom({ roomCode, nickname: joinFormData.nickname, isLoggedIn: false });

      // 방 참여 성공 시 /rooms/:roomId로 이동
      navigate(`/rooms/${response.roomId}`);
    } catch (error) {
      console.error('방 참여 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
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
              방 만들기
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
            isLoggedIn ? (
              <CreateRoomForm
                formData={createFormData}
                onChange={setCreateFormData}
                onSubmit={handleCreateSubmit}
              />
            ) : (
              <div className="login-required-message">
                <p>방을 만들려면 로그인이 필요합니다.</p>
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => setActiveTab('join')}
                >
                  방 참여하기로 이동
                </button>
              </div>
            )
          ) : (
            <JoinRoomForm
              formData={joinFormData}
              onChange={setJoinFormData}
              onSubmit={handleJoinSubmit}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
