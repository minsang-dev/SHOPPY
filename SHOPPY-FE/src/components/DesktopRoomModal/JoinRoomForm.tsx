import React from 'react';
import type { JoinRoomFormData } from '../../types/desktopRoomModal.types';
import './RoomModal.css';

interface JoinRoomFormProps {
  formData: JoinRoomFormData;
  onChange: (data: JoinRoomFormData) => void;
  onSubmit: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ formData, onChange, onSubmit }) => {
  const handleChange = (field: keyof JoinRoomFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <form className="join-room-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="form-field">
        <label className="form-label">닉네임</label>
        <input
          type="text"
          className="form-input"
          placeholder="30자 이내로 작성해 주세요."
          maxLength={30}
          value={formData.nickname}
          onChange={(e) => handleChange('nickname', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">입장 링크</label>
        <input
          type="text"
          className="form-input"
          placeholder="전달 받은 링크를 붙여 넣어 주세요."
          value={formData.entryLink}
          onChange={(e) => handleChange('entryLink', e.target.value)}
        />
      </div>

      <button type="submit" className="submit-button">
        쇼핑룸 입장하기
      </button>
    </form>
  );
};

export default JoinRoomForm;
