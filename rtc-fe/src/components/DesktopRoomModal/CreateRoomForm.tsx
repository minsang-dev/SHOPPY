import React, { useEffect } from 'react';
import type { CreateRoomFormData } from '../../types/desktopRoomModal.types';
import './RoomModal.css';

interface CreateRoomFormProps {
  formData: CreateRoomFormData; // 폼에 표시될 객체
  onChange: (data: CreateRoomFormData) => void;
  onSubmit: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ formData, onChange, onSubmit }) => {
  // 숫자 포맷팅 함수 (천 단위 구분)
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  // 예산 문자열을 숫자로 변환 (쉼표 제거)
  const parseBudget = (budgetStr: string): number => {
    const cleaned = budgetStr.replace(/,/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 목표 예산 값 가져오기
  const targetBudgetValue = parseBudget(formData.targetBudget);
  
  // 목표 예산이 1000원 미만인지 확인
  const isTargetBudgetInvalid = targetBudgetValue > 0 && targetBudgetValue < 1000;

  // 최소 예산 값 가져오기
  const minBudgetValue = formData.minBudget;
  
  // 최소 예산이 목표 예산을 초과하는지 확인
  const isMinBudgetInvalid = targetBudgetValue >= 1000 && minBudgetValue > targetBudgetValue;

  const handleChange = (field: keyof CreateRoomFormData, value: string | number) => {
    onChange({ ...formData, [field]: value });
  };

  // 목표 예산이 변경될 때 최소 예산이 목표 예산을 초과하지 않도록 조정
  useEffect(() => {
    if (targetBudgetValue >= 1000) {
      // 목표 예산이 1000원 이상일 때만 조정
      if (formData.minBudget > targetBudgetValue) {
        // 목표 예산을 초과하면 목표 예산으로 제한
        const roundedTarget = Math.floor(targetBudgetValue / 1000) * 1000;
        onChange({ ...formData, minBudget: roundedTarget });
      }
    } else if (targetBudgetValue > 0 && targetBudgetValue < 1000) {
      // 목표 예산이 1000원 미만이면 최소 예산을 0으로 설정
      if (formData.minBudget > 0) {
        onChange({ ...formData, minBudget: 0 });
      }
    }
  }, [targetBudgetValue]);

  const handleParticipantsChange = (delta: number) => {
    const newValue = Math.max(0, formData.participants + delta); // 음수는 허용X
    handleChange('participants', newValue);
  };

  // 목표 예산 입력 처리
  const handleTargetBudgetInput = (value: string) => {
    handleChange('targetBudget', value);
  };

  // 목표 예산 포커스 아웃 시 1000원 단위로 반올림
  const handleTargetBudgetBlur = () => {
    const currentValue = parseBudget(formData.targetBudget);
    if (currentValue >= 1000) {
      const roundedValue = Math.round(currentValue / 1000) * 1000;
      handleChange('targetBudget', formatNumber(roundedValue));
    } else if (currentValue > 0 && currentValue < 1000) {
      // 1000원 미만이면 빈 문자열로 설정 (에러 메시지 표시를 위해)
      // 또는 0으로 설정할 수도 있음
    }
  };

  // 최소 예산 입력 처리
  const handleMinBudgetInput = (value: string) => {
    const cleaned = value.replace(/,/g, '').trim();
    // 빈 문자열이면 0으로 처리
    if (cleaned === '') {
      handleChange('minBudget', 0);
      return;
    }
    
    // 숫자만 허용
    if (!/^\d+$/.test(cleaned)) {
      return; // 숫자가 아니면 무시
    }
    
    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed)) {
      return;
    }
    
    // 목표 예산을 초과하지 않도록 제한 (입력 중에는 1000원 단위로 반올림하지 않음)
    const maxValue = targetBudgetValue >= 1000 ? targetBudgetValue : 0;
    const clampedValue = Math.max(0, Math.min(parsed, maxValue));
    
    handleChange('minBudget', clampedValue);
  };

  // 최소 예산 포커스 아웃 시 1000원 단위로 반올림
  const handleMinBudgetBlur = () => {
    if (formData.minBudget > 0) {
      const roundedValue = Math.round(formData.minBudget / 1000) * 1000;
      const maxValue = targetBudgetValue >= 1000 ? Math.floor(targetBudgetValue / 1000) * 1000 : 0;
      const clampedValue = Math.max(0, Math.min(roundedValue, maxValue));
      handleChange('minBudget', clampedValue);
    }
  };

  return (
    <form className="create-room-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="form-field">
        <label className="form-label">방 제목</label>
        <input
          type="text"
          className="form-input"
          placeholder="ex. MT 장 보기"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">쇼핑 목적</label>
        <input
          type="text"
          className="form-input"
          placeholder="ex. 여행, 선물, 혼수"
          value={formData.purpose}
          onChange={(e) => handleChange('purpose', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">관심 카테고리</label>
        <input
          type="text"
          className="form-input"
          placeholder="ex. 식료품, 가전, 의류"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">인원수</label>
        <div className="number-input">
          <button
            type="button"
            className="number-button"
            onClick={() => handleParticipantsChange(-1)}
          >
            −
          </button>
          <span className="number-value">{formData.participants}</span>
          <button
            type="button"
            className="number-button"
            onClick={() => handleParticipantsChange(1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">목표 예산</label>
        <div className="budget-input-wrapper">
          <input
            type="text"
            className={`form-input ${isTargetBudgetInvalid ? 'form-input-error' : ''}`}
            placeholder="ex. 200,000"
            value={formData.targetBudget}
            onChange={(e) => handleTargetBudgetInput(e.target.value)}
            onBlur={handleTargetBudgetBlur}
          />
          <span className="currency-unit">원</span>
        </div>
        {isTargetBudgetInvalid && (
          <p className="budget-error-message">예산은 1000원 이상이어야 합니다</p>
        )}
      </div>

      <div className="form-field">
        <label className="form-label">최소 예산</label>
        <div className="budget-input-wrapper">
          <input
            type="text"
            className={`form-input ${isMinBudgetInvalid ? 'form-input-error' : ''}`}
            placeholder="ex. 50,000"
            value={formatNumber(formData.minBudget)}
            onChange={(e) => handleMinBudgetInput(e.target.value)}
            onBlur={handleMinBudgetBlur}
            disabled={targetBudgetValue < 1000}
          />
          <span className="currency-unit">원</span>
        </div>
        {targetBudgetValue === 0 && (
          <p className="min-budget-hint">목표 예산을 먼저 입력해주세요</p>
        )}
        {isTargetBudgetInvalid && (
          <p className="min-budget-hint">목표 예산을 1000원 이상으로 입력해주세요</p>
        )}
        {isMinBudgetInvalid && (
          <p className="budget-error-message">최소 예산은 목표 예산을 초과할 수 없습니다</p>
        )}
      </div>

      <div className="form-field">
        <label className="form-label">동기화 모드</label>
        <div className="mode-radio-group">
          <label className="mode-radio">
            <input
              type="radio"
              name="mode"
              value="personal"
              checked={formData.mode === 'personal'}
              onChange={(e) => handleChange('mode', e.target.value as 'personal' | 'host')}
            />
            <span>개인 모드</span>
          </label>
          <label className="mode-radio">
            <input
              type="radio"
              name="mode"
              value="host"
              checked={formData.mode === 'host'}
              onChange={(e) => handleChange('mode', e.target.value as 'personal' | 'host')}
            />
            <span>호스트 모드</span>
          </label>
        </div>
      </div>

      <div className="form-tip">
        <span className="tip-icon">💡</span>
        <span className="tip-text">팁) AI가 위시리스트를 자동 작성해 줍니다.</span>
      </div>

      <button type="submit" className="submit-button">
        쇼핑룸 입장하기
      </button>
    </form>
  );
};

export default CreateRoomForm;
