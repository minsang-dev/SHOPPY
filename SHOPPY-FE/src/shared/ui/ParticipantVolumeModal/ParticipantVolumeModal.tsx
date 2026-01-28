import React from 'react';
import './ParticipantVolumeModal.css';

interface ParticipantVolumeModalProps {
  isOpen: boolean;
  participantName: string;
  volume: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

const ParticipantVolumeModal: React.FC<ParticipantVolumeModalProps> = ({
  isOpen,
  participantName,
  volume,
  onChange,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="participant-volume-modal" role="dialog" aria-modal="true">
      <div className="participant-volume-modal-backdrop" onClick={onClose} />
      <div className="participant-volume-modal-card">
        <div className="participant-volume-modal-header">
          <h3 className="participant-volume-modal-title">음량 조절</h3>
          <button
            type="button"
            className="participant-volume-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </div>
        <div className="participant-volume-modal-body">
          <div className="participant-volume-modal-name">{participantName}</div>
          <div className="participant-volume-control">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => onChange(Number(event.target.value))}
            />
            <span className="participant-volume-value">{volume}%</span>
          </div>
        </div>
        <div className="participant-volume-modal-actions">
          <button type="button" className="participant-volume-modal-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantVolumeModal;
