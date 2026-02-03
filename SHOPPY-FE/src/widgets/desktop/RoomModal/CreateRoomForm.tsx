import React, { useState, useEffect } from 'react';
import type {
  CreateRoomFormData,
  ShoppingPurpose,
  InterestCategory,
  ShoppingTrait,
} from '../../../entities/room/types/desktopRoomModal.types';
import {
  MUTUALLY_EXCLUSIVE_TRAITS,
  ALL_INTEREST_CATEGORIES,
} from '../../../entities/room/types/desktopRoomModal.types';
import './RoomModal.css';

interface CreateRoomFormProps {
  formData: CreateRoomFormData;
  onChange: (data: CreateRoomFormData) => void;
  onSubmit: () => void;
}

// 쇼핑 목적 옵션
const PURPOSE_OPTIONS: { value: ShoppingPurpose; label: string; emoji: string }[] = [
  { value: 'TRAVEL', label: '여행', emoji: '✈️' },
  { value: 'MT', label: 'MT/단체행사', emoji: '🏕️' },
  { value: 'PARTY', label: '파티', emoji: '🎉' },
  { value: 'CAMPING', label: '캠핑', emoji: '⛺' },
  { value: 'DAILY', label: '일상장보기', emoji: '🛒' },
  { value: 'GIFT', label: '선물', emoji: '🎁' },
];

// 관심 카테고리 옵션
const CATEGORY_OPTIONS: { value: InterestCategory; label: string; emoji: string }[] = [
  { value: 'FOOD_READY', label: '즉석식품', emoji: '🍱' },
  { value: 'MEAT_RAW', label: '정육', emoji: '🥩' },
  { value: 'VEGETABLE_RAW', label: '채소/과일', emoji: '🥬' },
  { value: 'FRESH_READY', label: '신선편의', emoji: '🥗' },
  { value: 'DRINK_NON_ALCOHOL', label: '음료', emoji: '🧃' },
  { value: 'ALCOHOL', label: '주류', emoji: '🍺' },
  { value: 'SNACK', label: '간식', emoji: '🍪' },
  { value: 'COOKING_TOOL', label: '조리도구', emoji: '🍳' },
  { value: 'SUPPLY', label: '생활용품', emoji: '🧴' },
];

// 특성 옵션 (그룹별)
const TRAIT_GROUPS: { groupLabel: string; traits: { value: ShoppingTrait; label: string }[] }[] = [
  {
    groupLabel: '가격대',
    traits: [
      { value: 'VALUE', label: '가성비' },
      { value: 'PREMIUM', label: '프리미엄' },
      { value: 'BALANCED', label: '균형잡힌' },
    ],
  },
  {
    groupLabel: '수량',
    traits: [
      { value: 'BULK', label: '대용량' },
      { value: 'MINIMAL', label: '소용량' },
    ],
  },
  {
    groupLabel: '장소',
    traits: [
      { value: 'OUTDOOR', label: '야외용' },
      { value: 'INDOOR', label: '실내용' },
    ],
  },
  {
    groupLabel: '조리',
    traits: [
      { value: 'COOKING_OK', label: '조리 가능' },
      { value: 'COOKING_AVAILABLE', label: '조리 시설 있음' },
      { value: 'NO_COOKING', label: '조리 불가' },
      { value: 'EASY_COOK', label: '간편조리' },
    ],
  },
  {
    groupLabel: '식사 스타일',
    traits: [
      { value: 'MEAL_MAIN', label: '식사 위주' },
      { value: 'SNACK_MAIN', label: '간식 위주' },
      { value: 'VARIETY_OK', label: '다양하게' },
    ],
  },
  {
    groupLabel: '취향',
    traits: [
      { value: 'MEAT_LOVER', label: '육식 선호' },
      { value: 'VEGGIE', label: '채식 선호' },
    ],
  },
  {
    groupLabel: '품목 종류',
    traits: [
      { value: 'CONSUMABLE', label: '소모품' },
      { value: 'EQUIPMENT', label: '장비류' },
      { value: 'TOOL', label: '도구류' },
    ],
  },
];

const TOTAL_STEPS = 5;

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ formData, onChange, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // 숫자 포맷팅 함수 (천 단위 구분)
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  const parseBudget = (budgetStr: string): number => {
    const cleaned = budgetStr.replace(/,/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const targetBudgetValue = parseBudget(formData.targetBudget);
  const isTargetBudgetInvalid = targetBudgetValue > 0 && targetBudgetValue < 1000;
  const isMinBudgetInvalid = targetBudgetValue >= 1000 && formData.minBudget > targetBudgetValue;

  // 목표 예산이 변경될 때 최소 예산이 목표 예산을 초과하지 않도록 조정
  useEffect(() => {
    if (targetBudgetValue >= 1000) {
      if (formData.minBudget > targetBudgetValue) {
        const roundedTarget = Math.floor(targetBudgetValue / 1000) * 1000;
        onChange({ ...formData, minBudget: roundedTarget });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBudgetValue]);

  const handleChange = (field: keyof CreateRoomFormData, value: unknown) => {
    onChange({ ...formData, [field]: value });
  };

  const handleParticipantsChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(99, formData.participants + delta));
    handleChange('participants', newValue);
  };

  const handleParticipantsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      handleChange('participants', 1);
      return;
    }
    const v = parseInt(raw, 10);
    if (!isNaN(v)) {
      handleChange('participants', Math.max(1, Math.min(99, v)));
    }
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
    }
  };

  // 최소 예산 입력 처리
  const handleMinBudgetInput = (value: string) => {
    const cleaned = value.replace(/,/g, '').trim();
    if (cleaned === '') {
      handleChange('minBudget', 0);
      return;
    }
    if (!/^\d+$/.test(cleaned)) return;

    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed)) return;

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

  // 카테고리 토글
  const toggleCategory = (category: InterestCategory) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter((c) => c !== category)
      : [...formData.categories, category];
    handleChange('categories', newCategories);
  };

  // 전체 선택 / 전체 해제 토글
  const toggleAllCategories = () => {
    const allSelected = formData.categories.length === ALL_INTEREST_CATEGORIES.length;
    handleChange('categories', allSelected ? [] : [...ALL_INTEREST_CATEGORIES]);
  };

  // 특성 토글 (상호배타 체크)
  const toggleTrait = (trait: ShoppingTrait) => {
    let newTraits = [...formData.traits];

    if (newTraits.includes(trait)) {
      // 이미 선택된 경우 제거
      newTraits = newTraits.filter((t) => t !== trait);
    } else {
      // 상호배타 체크: 충돌하는 특성 제거
      for (const [a, b] of MUTUALLY_EXCLUSIVE_TRAITS) {
        if (trait === a && newTraits.includes(b)) {
          newTraits = newTraits.filter((t) => t !== b);
        } else if (trait === b && newTraits.includes(a)) {
          newTraits = newTraits.filter((t) => t !== a);
        }
      }
      newTraits.push(trait);
    }

    handleChange('traits', newTraits);
  };

  // 다음 단계로 이동
  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 이전 단계로 이동
  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 현재 단계 유효성 검사
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0 && formData.participants >= 1;
      case 2:
        return formData.purpose !== '';
      case 3:
        return formData.categories.length > 0;
      case 4:
        return true; // traits는 빈 배열 허용
      case 5:
        return targetBudgetValue >= 1000 && !isMinBudgetInvalid;
      default:
        return false;
    }
  };

  // 단계별 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">기본 정보</h3>
            <p className="step-description">쇼핑룸의 기본 정보를 입력해주세요.</p>

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
              <label className="form-label">인원수</label>
              <div className="number-input">
                <button
                  type="button"
                  className="number-button"
                  onClick={() => handleParticipantsChange(-1)}
                >
                  −
                </button>
                <input
                  type="number"
                  className="number-value number-value-input"
                  min={1}
                  max={99}
                  value={formData.participants}
                  onChange={handleParticipantsInput}
                  aria-label="인원수"
                />
                <button
                  type="button"
                  className="number-button"
                  onClick={() => handleParticipantsChange(1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">쇼핑 목적</h3>
            <p className="step-description">어떤 목적으로 쇼핑하시나요?</p>

            <div className="option-grid">
              {PURPOSE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-card ${formData.purpose === option.value ? 'selected' : ''}`}
                  onClick={() => handleChange('purpose', option.value)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: {
        const allCategoriesSelected = formData.categories.length === ALL_INTEREST_CATEGORIES.length;
        return (
          <div className="step-content">
            <h3 className="step-title">관심 카테고리</h3>
            <p className="step-description">관심있는 카테고리를 선택해주세요. (복수 선택 가능)</p>

            <div className="category-step-content">
              <div className="category-select-all-row">
                <button
                  type="button"
                  className={`option-card ${allCategoriesSelected ? 'selected' : ''}`}
                  onClick={toggleAllCategories}
                >
                  <span className="option-emoji">✓</span>
                  <span className="option-label">전체 선택</span>
                </button>
              </div>
              <div className="option-grid">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`option-card ${formData.categories.includes(option.value) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(option.value)}
                  >
                    <span className="option-emoji">{option.emoji}</span>
                    <span className="option-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">선호 특성</h3>
            <p className="step-description">AI가 더 정확한 추천을 할 수 있도록 선호사항을 알려주세요. (선택)</p>

            <div className="trait-groups">
              {TRAIT_GROUPS.map((group) => (
                <div key={group.groupLabel} className="trait-group">
                  <span className="trait-group-label">{group.groupLabel}</span>
                  <div className="trait-buttons">
                    {group.traits.map((trait) => (
                      <button
                        key={trait.value}
                        type="button"
                        className={`trait-button ${formData.traits.includes(trait.value) ? 'selected' : ''}`}
                        onClick={() => toggleTrait(trait.value)}
                      >
                        {trait.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3 className="step-title">예산 설정</h3>
            <p className="step-description">목표 예산과 최소 예산을 입력해주세요.</p>

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

            <div className="form-tip form-tip-summary">
              <span className="tip-icon-summary">✨</span>
              <span className="tip-text">입력된 정보를 바탕으로 상품리스트가 자동 생성됩니다.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form
      className="create-room-form step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === TOTAL_STEPS && isCurrentStepValid()) {
          onSubmit();
        }
      }}
    >
      {/* 진행 표시 */}
      <div className="step-progress">
        <div className="step-progress-bar">
          <div
            className="step-progress-fill"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <span className="step-progress-text">{currentStep}/{TOTAL_STEPS}</span>
      </div>

      {renderStep()}

      {/* 네비게이션 버튼 */}
      <div className="step-navigation">
        {currentStep > 1 && (
          <button type="button" className="step-nav-button prev" onClick={goPrev}>
            이전
          </button>
        )}
        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            className="step-nav-button next"
            onClick={goNext}
            disabled={!isCurrentStepValid()}
          >
            다음
          </button>
        ) : (
          <button
            type="submit"
            className="submit-button"
            disabled={!isCurrentStepValid()}
          >
            쇼핑룸 입장하기
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateRoomForm;
