import React, { useState } from 'react';
import './CreateVoteModal.css';

interface CreateVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, options: string[]) => void;
}

/**
 * 투표 생성 모달 컴포넌트
 */
const CreateVoteModal: React.FC<CreateVoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (trimmedTitle && trimmedOptions.length >= 2) {
      onSubmit(trimmedTitle, trimmedOptions);
      // 폼 초기화
      setTitle('');
      setOptions(['', '']);
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setOptions(['', '']);
    onClose();
  };

  const isValid = title.trim().length > 0 && options.filter(opt => opt.trim().length > 0).length >= 2;

  return (
    <div className="create-vote-modal-overlay" onClick={handleCancel}>
      <div className="create-vote-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="create-vote-modal-title">새 투표 생성하기</h2>
        
        <div className="create-vote-form">
          <div className="create-vote-field">
            <label className="create-vote-label">투표 제목</label>
            <input
              type="text"
              className="create-vote-text"
              placeholder="투표 제목을 입력하세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="create-vote-field">
            <label className="create-vote-label">선택지</label>
            <div className="create-vote-options">
              {options.map((option, index) => (
                <div key={index} className="create-vote-option-row">
                  <input
                    type="text"
                    className="create-vote-text"
                    placeholder={`옵션${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      className="create-vote-remove-btn"
                      onClick={() => handleRemoveOption(index)}
                      type="button"
                      aria-label="옵션 삭제"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="create-vote-add-btn"
              onClick={handleAddOption}
              type="button"
            >
              + 옵션 추가
            </button>
          </div>
        </div>

        <div className="create-vote-modal-actions">
          <button
            className="create-vote-cancel-btn"
            onClick={handleCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="create-vote-submit-btn"
            onClick={handleSubmit}
            disabled={!isValid}
            type="button"
          >
            투표 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVoteModal;
