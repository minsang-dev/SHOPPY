import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVoteRealtime } from '@/features/vote/model/useVoteRealtime';
import { closeVote } from '@/entities/vote/api/voteApi';
import { useRoomInfo } from '@/features/room/fetch-room/model/useRoomInfo';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
import CreateVoteModal from '@/features/vote/create-vote/ui/CreateVoteModal';
import './VotePanel.css';

const VotePanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [participateLoading, setParticipateLoading] = useState(false);

  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);
  const isHost = user?.id === room?.hostId;

  const {
    votes,
    voteDetail,
    loading,
    detailLoading,
    error,
    refetchVoteList,
    createVote,
    participate,
  } = useVoteRealtime({ roomId, selectedVoteId });

  const handleCreateVote = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateVoteSubmit = async (title: string, options: string[]) => {
    if (!roomId) return;
    try {
      await createVote({ title, options });
    } catch (err) {
      console.error('투표 생성 실패:', err);
    }
  };

  const handleVoteCardClick = (voteId: number) => {
    setSelectedVoteId(voteId);
  };

  const handleBackToList = () => {
    setSelectedVoteId(null);
  };

  const handleOptionClick = async (optionId: number) => {
    if (!selectedVoteId || participateLoading) return;
    setParticipateLoading(true);
    try {
      await participate(selectedVoteId, { optionId });
    } catch (err) {
      console.error('투표 실패:', err);
    } finally {
      setParticipateLoading(false);
    }
  };

  const handleCloseVote = async () => {
    if (!roomId || !selectedVoteId || closeLoading) return;
    try {
      setCloseLoading(true);
      await closeVote(roomId, selectedVoteId);
      setIsCloseModalOpen(false);
      setSelectedVoteId(null);
      await refetchVoteList();
    } catch (err) {
      console.error('투표 마감 실패:', err);
    } finally {
      setCloseLoading(false);
    }
  };

  if (selectedVoteId !== null) {
    const totalVotes = voteDetail
      ? voteDetail.options.reduce((sum, option) => sum + option.voteCount, 0)
      : 0;

    return (
      <div className="panel-content vote-panel">
        <div className="vote-detail-header">
          <h3 className="vote-detail-title">{voteDetail?.title || '투표'}</h3>
          {voteDetail && (
            <span className={`vote-status-badge status-${voteDetail.status.toLowerCase()}`}>
              진행 중
            </span>
          )}
        </div>

        {detailLoading ? (
          <div className="vote-loading">
            <p>로딩 중...</p>
          </div>
        ) : voteDetail ? (
          <>
            <div className="vote-detail-options">
              {voteDetail.options.map((option) => {
                const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                const isSelected = voteDetail.mySelectedOptionId === option.optionId;
                const isClosed = voteDetail.status === 'CLOSED';

                return (
                  <div
                    key={option.optionId}
                    className={`vote-detail-option ${isSelected ? 'selected' : ''} ${isClosed ? 'disabled' : ''}`}
                    onClick={() => !isClosed && handleOptionClick(option.optionId)}
                    role={isClosed ? 'presentation' : 'button'}
                    tabIndex={isClosed ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!isClosed && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleOptionClick(option.optionId);
                      }
                    }}
                  >
                    <div className="vote-option-row">
                      <span className="vote-option-content">{option.content}</span>
                      <span className="vote-option-count">
                        {option.voteCount}표 ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="vote-progress-bar">
                      <div
                        className="vote-progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="vote-detail-actions">
              {isHost && voteDetail.status === 'OPEN' && (
                <button
                  className="vote-close-button"
                  onClick={() => setIsCloseModalOpen(true)}
                  disabled={closeLoading}
                >
                  투표 마감하기
                </button>
              )}
              <button className="vote-back-button" onClick={handleBackToList}>
                투표목록으로 가기
              </button>
            </div>

            {isCloseModalOpen && (
              <div className="vote-modal-overlay" onClick={() => setIsCloseModalOpen(false)}>
                <div className="vote-modal" onClick={(e) => e.stopPropagation()}>
                  <h4 className="vote-modal-title">투표 마감</h4>
                  <p className="vote-modal-message">
                    정말 이 투표를 마감하시겠습니까?<br />
                    마감 후에는 더 이상 투표할 수 없습니다.
                  </p>
                  <div className="vote-modal-actions">
                    <button
                      className="vote-modal-cancel"
                      onClick={() => setIsCloseModalOpen(false)}
                      disabled={closeLoading}
                    >
                      취소
                    </button>
                    <button
                      className="vote-modal-confirm"
                      onClick={handleCloseVote}
                      disabled={closeLoading}
                    >
                      {closeLoading ? '마감 중...' : '마감하기'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="panel-content vote-panel">
      <h3>투표 목록</h3>

      {loading ? (
        <div className="vote-loading">
          <p>로딩 중...</p>
        </div>
      ) : error ? (
        <div className="vote-error">
          <p>투표 목록을 불러오는데 실패했습니다.</p>
        </div>
      ) : (
        <>
          <div className="vote-list">
            {votes.length === 0 ? (
              <div className="vote-empty">
                <p>진행 중인 투표가 없습니다.</p>
              </div>
            ) : (
              votes.map((vote) => (
                <div
                  key={vote.voteId}
                  className="vote-card"
                  onClick={() => handleVoteCardClick(vote.voteId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleVoteCardClick(vote.voteId);
                    }
                  }}
                >
                  <div className="vote-card-content">
                    <h4 className="vote-card-title">{vote.title}</h4>
                    <span className="vote-status-badge status-open">진행 중</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {isHost && (
            <button className="vote-create-button" onClick={handleCreateVote}>
              + 새 투표 생성하기
            </button>
          )}
        </>
      )}

      <CreateVoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVoteSubmit}
      />
    </div>
  );
};

export default VotePanel;
