import React, { useState } from 'react';
import { useVoteRealtime } from '@/features/vote/model/useVoteRealtime';
import './MobilePanels.css';

interface MobileVotePanelProps {
  roomId?: string;
}

const MobileVotePanel: React.FC<MobileVotePanelProps> = ({ roomId }) => {
  const [showCreateVote, setShowCreateVote] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [participateLoading, setParticipateLoading] = useState(false);

  const {
    votes,
    voteDetail,
    loading,
    detailLoading,
    error,
    createVote,
    participate,
  } = useVoteRealtime({ roomId, selectedVoteId });

  const totalVotes = voteDetail
    ? voteDetail.options.reduce((sum, option) => sum + option.voteCount, 0)
    : 0;

  const isClosed = voteDetail?.status === 'CLOSED';

  const handleAddOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId) return;

    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((option) => option.trim()).filter(Boolean);

    if (!trimmedTitle || trimmedOptions.length < 2) return;

    try {
      await createVote({ title: trimmedTitle, options: trimmedOptions });
      handleCreateClose();
    } catch (err) {
      console.error('투표 생성 실패:', err);
    }
  };

  const handleVote = async (optionId: number) => {
    if (!selectedVoteId || isClosed || participateLoading) return;

    setParticipateLoading(true);
    try {
      await participate(selectedVoteId, { optionId });
    } catch (err) {
      console.error('투표 실패:', err);
    } finally {
      setParticipateLoading(false);
    }
  };

  const handleOpenVote = (voteId: number) => {
    setSelectedVoteId(voteId);
    setShowVoteModal(true);
  };

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">진행 중인 투표</div>
        {loading ? (
          <div className="mobile-panel-empty">로딩 중...</div>
        ) : error ? (
          <div className="mobile-panel-empty">투표 목록을 불러오는데 실패했습니다.</div>
        ) : votes.length === 0 ? (
          <div className="mobile-panel-empty">현재 진행 중인 투표가 없습니다.</div>
        ) : (
          <div className="mobile-vote-list">
            {votes.map((item) => (
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
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {showVoteModal && selectedVoteId && (
        <div className="mobile-vote-detail-modal">
          <div className="mobile-vote-modal-backdrop" onClick={handleVoteModalClose} />
          <div className="mobile-vote-detail-card">
            {detailLoading ? (
              <div className="mobile-panel-empty">로딩 중...</div>
            ) : voteDetail ? (
              <>
                <div className="mobile-vote-modal-header">
                  <h3 className="mobile-vote-modal-title">{voteDetail.title}</h3>
                  <button type="button" className="mobile-vote-modal-close" onClick={handleVoteModalClose}>
                    <i className="ri-close-line" aria-hidden="true" />
                  </button>
                </div>
                <div className="mobile-vote-detail-options">
                  {voteDetail.options.map((option) => {
                    const ratio =
                      totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
                    const isSelected = voteDetail.mySelectedOptionId === option.optionId;
                    return (
                      <button
                        key={option.optionId}
                        type="button"
                        className={`mobile-vote-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleVote(option.optionId)}
                        disabled={isClosed || participateLoading}
                      >
                        <div className="mobile-vote-option-row">
                          <span>{option.content}</span>
                          <span className="mobile-vote-count">
                            {option.voteCount}명 ({ratio}%)
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
              </>
            ) : (
              <div className="mobile-panel-empty">투표를 불러올 수 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MobileVotePanel;
