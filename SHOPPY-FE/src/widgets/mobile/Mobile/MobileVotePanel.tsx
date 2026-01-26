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
  onDeleteVote?: (voteId: number) => void;
}

const MobileVotePanel: React.FC<MobileVotePanelProps> = ({
  vote,
  totalParticipants,
  onCreateVote,
  onVote,
  onDeleteVote,
}) => {
  const [showCreateVote, setShowCreateVote] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [localVotes, setLocalVotes] = useState<VoteData[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  const voteList = useMemo(() => {
    if (vote) {
      return [vote, ...localVotes];
    }
    return localVotes;
  }, [vote, localVotes]);

  const selectedVote = useMemo(() => {
    if (!selectedVoteId) return null;
    return voteList.find((item) => item.voteId === selectedVoteId) ?? null;
  }, [selectedVoteId, voteList]);

  const totalVotes = useMemo(() => {
    if (!selectedVote) {
      return 0;
    }
    return selectedVote.options.reduce((sum, option) => sum + (option.votes ?? 0), 0);
  }, [selectedVote]);

  const majorityVotes = totalParticipants ? Math.ceil(totalParticipants / 2) : 0;
  const isClosed =
    selectedVote?.status === 'CLOSED' ||
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

  const resetCreateForm = () => {
    setTitle('');
    setOptions(['', '']);
  };

  const handleCreateClose = () => {
    setShowCreateVote(false);
    resetCreateForm();
  };

  const handleVoteModalClose = () => {
    setShowVoteModal(false);
    setSelectedVoteId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: CreateVotePayload = {
      title: title.trim(),
      options: options.map((option) => option.trim()).filter(Boolean),
    };

    onCreateVote?.(payload);

    if (payload.title && payload.options.length >= 2) {
      setLocalVotes((prev) => [
        ...prev,
        {
          voteId: Date.now(),
          title: payload.title,
          status: 'OPEN',
          options: payload.options.map((option, index) => ({
            optionId: index + 1,
            content: option,
            votes: 0,
          })),
        },
      ]);
    }

    handleCreateClose();
  };

  const handleVote = (voteId: number, optionId: number) => {
    if (isClosed) {
      return;
    }
    const previousOptionId = selectedOptions[voteId];
    if (previousOptionId === optionId) {
      return;
    }

    onVote?.(optionId);

    setSelectedOptions((prev) => ({
      ...prev,
      [voteId]: optionId,
    }));

    setLocalVotes((prev) =>
      prev.map((item) => {
        if (item.voteId !== voteId) {
          return item;
        }
        return {
          ...item,
          options: item.options.map((option) => {
            if (option.optionId === optionId) {
              return { ...option, votes: (option.votes ?? 0) + 1 };
            }
            if (previousOptionId && option.optionId === previousOptionId) {
              return { ...option, votes: Math.max((option.votes ?? 0) - 1, 0) };
            }
            return option;
          }),
        };
      }),
    );
  };

  const handleOpenVote = (voteId: number) => {
    setSelectedVoteId(voteId);
    setShowVoteModal(true);
  };

  const handleDeleteVote = (voteId: number) => {
    onDeleteVote?.(voteId);
    setLocalVotes((prev) => prev.filter((item) => item.voteId !== voteId));
    if (selectedVoteId === voteId) {
      handleVoteModalClose();
    }
  };

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">투표</div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">진행 중인 투표</div>
        {voteList.length === 0 ? (
          <div className="mobile-panel-empty">현재 진행 중인 투표가 없습니다.</div>
        ) : (
          <div className="mobile-vote-list">
            {voteList.map((item) => {
              const itemVotes = item.options.reduce((sum, option) => sum + (option.votes ?? 0), 0);
              return (
                <div key={item.voteId} className="mobile-vote-item">
                  <button
                    type="button"
                    className="mobile-vote-item-body"
                    onClick={() => handleOpenVote(item.voteId)}
                  >
                    <div className="mobile-vote-item-title">
                      {item.title}
                      <span
                        className={`mobile-vote-status ${item.status === 'CLOSED' ? 'closed' : ''}`}
                      >
                        {item.status === 'CLOSED' ? '투표 종료' : '진행중'}
                      </span>
                    </div>
                    <div className="mobile-vote-item-meta">
                      선택지 {item.options.length}개 참여 {itemVotes}명
                    </div>
                  </button>
                  <button
                    type="button"
                    className="mobile-vote-item-delete"
                    onClick={() => handleDeleteVote(item.voteId)}
                    aria-label="투표 삭제"
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
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
          <div className="mobile-vote-modal-backdrop" onClick={handleCreateClose} />
          <div className="mobile-vote-modal-card">
            <div className="mobile-vote-modal-header">
              <h3 className="mobile-vote-modal-title">새 투표 만들기</h3>
              <button type="button" className="mobile-vote-modal-close" onClick={handleCreateClose}>
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
              <div className="mobile-vote-modal-label">옵션</div>
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
                <button type="button" className="mobile-vote-modal-cancel" onClick={handleCreateClose}>
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

      {showVoteModal && selectedVote && (
        <div className="mobile-vote-detail-modal">
          <div className="mobile-vote-modal-backdrop" onClick={handleVoteModalClose} />
          <div className="mobile-vote-detail-card">
            <div className="mobile-vote-modal-header">
              <h3 className="mobile-vote-modal-title">{selectedVote.title}</h3>
              <button type="button" className="mobile-vote-modal-close" onClick={handleVoteModalClose}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="mobile-vote-detail-options">
              {selectedVote.options.map((option) => {
                const ratio =
                  totalVotes > 0 ? Math.round(((option.votes ?? 0) / totalVotes) * 100) : 0;
                return (
                  <button
                    key={option.optionId}
                    type="button"
                    className="mobile-vote-option"
                    onClick={() => handleVote(selectedVote.voteId, option.optionId)}
                    disabled={isClosed}
                  >
                    <div className="mobile-vote-option-row">
                      <span>{option.content}</span>
                      <span className="mobile-vote-count">
                        {option.votes ?? 0}명 ({ratio}%)
                      </span>
                    </div>
                    <div className="mobile-vote-bar">
                      <div className="mobile-vote-bar-fill" style={{ width: `${ratio}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mobile-vote-detail-footer">
              총 {totalVotes}명 투표
              <span className={`mobile-vote-status ${isClosed ? 'closed' : ''}`}>
                {isClosed ? '투표 종료' : '진행중'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MobileVotePanel;
