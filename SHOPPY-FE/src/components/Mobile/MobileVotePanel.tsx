import React, { useMemo, useState } from 'react';
import './MobilePanels.css';

export interface VoteOption {
  optionId: number;
  content: string;
  votes?: number;
}

export interface VoteData {
  voteId: number;
  title: string;
  status: 'OPEN' | 'CLOSED';
  options: VoteOption[];
}

interface CreateVotePayload {
  title: string;
  options: string[];
}

interface MobileVotePanelProps {
  vote?: VoteData;
  totalParticipants?: number;
  onCreateVote?: (payload: CreateVotePayload) => void;
  onVote?: (optionId: number) => void;
}

const MobileVotePanel: React.FC<MobileVotePanelProps> = ({
  vote,
  totalParticipants,
  onCreateVote,
  onVote,
}) => {
  const [showCreateVote, setShowCreateVote] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [localVote, setLocalVote] = useState<VoteData | null>(null);

  const activeVote = vote ?? localVote;

  const totalVotes = useMemo(() => {
    if (!activeVote) {
      return 0;
    }
    return activeVote.options.reduce((sum, option) => sum + (option.votes ?? 0), 0);
  }, [activeVote]);

  const majorityVotes = totalParticipants ? Math.ceil(totalParticipants / 2) : 0;
  const isClosed =
    activeVote?.status === 'CLOSED' ||
    (!!totalParticipants && (totalVotes >= totalParticipants || totalVotes >= majorityVotes));

  const handleAddOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setShowCreateVote(false);
    setTitle('');
    setOptions(['', '']);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: CreateVotePayload = {
      title: title.trim(),
      options: options.map((option) => option.trim()).filter(Boolean),
    };
    onCreateVote?.(payload);
    if (payload.title && payload.options.length >= 2) {
      setLocalVote({
        voteId: Date.now(),
        title: payload.title,
        status: 'OPEN',
        options: payload.options.map((option, index) => ({
          optionId: index + 1,
          content: option,
          votes: 0,
        })),
      });
    }
    handleClose();
  };

  const handleVote = (optionId: number) => {
    if (isClosed) {
      return;
    }
    onVote?.(optionId);
  };

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">투표</div>
      <div className="mobile-panel-card">
        {activeVote ? (
          <div className="mobile-vote-card">
            <div className="mobile-vote-header">
              <div className="mobile-vote-title">
                {activeVote.title}
                <span className="mobile-vote-dot" />
              </div>
              <span className={`mobile-vote-status ${isClosed ? 'closed' : ''}`}>
                {isClosed ? '투표 종료' : '진행중'}
              </span>
            </div>
            <div className="mobile-vote-options">
              {activeVote.options.map((option) => {
                const ratio =
                  totalVotes > 0 ? Math.round(((option.votes ?? 0) / totalVotes) * 100) : 0;
                return (
                  <button
                    key={option.optionId}
                    type="button"
                    className="mobile-vote-option"
                    onClick={() => handleVote(option.optionId)}
                    disabled={isClosed}
                  >
                    <div className="mobile-vote-option-row">
                      <span>{option.content}</span>
                      <span className="mobile-vote-count">
                        {option.votes ?? 0}표 ({ratio}%)
                      </span>
                    </div>
                    <div className="mobile-vote-bar">
                      <div className="mobile-vote-bar-fill" style={{ width: `${ratio}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mobile-vote-footer">총 {totalVotes}명 투표</div>
          </div>
        ) : (
          <>
            <div className="mobile-panel-title">진행 중인 투표</div>
            <div className="mobile-panel-empty">현재 진행 중인 투표가 없습니다.</div>
          </>
        )}
      </div>
      <button
        type="button"
        className="mobile-panel-action vote-create-button"
        onClick={() => setShowCreateVote(true)}
      >
        <i className="ri-add-line" aria-hidden="true" />새 투표 만들기
      </button>

      {showCreateVote && (
        <div className="mobile-vote-modal">
          <div className="mobile-vote-modal-backdrop" onClick={handleClose} />
          <div className="mobile-vote-modal-card">
            <div className="mobile-vote-modal-header">
              <h3 className="mobile-vote-modal-title">새 투표 만들기</h3>
              <button type="button" className="mobile-vote-modal-close" onClick={handleClose}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <form className="mobile-vote-modal-form" onSubmit={handleSubmit}>
              <label className="mobile-vote-modal-label" htmlFor="vote-title">
                투표 제목
              </label>
              <input
                id="vote-title"
                type="text"
                className="mobile-vote-modal-input"
                placeholder="투표 제목을 입력하세요"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <div className="mobile-vote-modal-label">선택지</div>
              <div className="mobile-vote-modal-options">
                {options.map((option, index) => (
                  <div key={`option-${index}`} className="mobile-vote-modal-option">
                    <input
                      type="text"
                      className="mobile-vote-modal-input"
                      placeholder={`옵션 ${index + 1}`}
                      value={option}
                      onChange={(event) => handleOptionChange(index, event.target.value)}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="mobile-vote-modal-remove"
                        onClick={() => handleRemoveOption(index)}
                        aria-label={`옵션 ${index + 1} 삭제`}
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="mobile-vote-modal-add" onClick={handleAddOption}>
                <i className="ri-add-line" aria-hidden="true" />
                옵션 추가
              </button>
              <div className="mobile-vote-modal-actions">
                <button type="button" className="mobile-vote-modal-cancel" onClick={handleClose}>
                  취소
                </button>
                <button type="submit" className="mobile-vote-modal-submit">
                  투표 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MobileVotePanel;
