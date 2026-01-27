import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVoteList } from '@/features/vote/fetch-vote-list/model/useVoteList';
import { useVoteDetail } from '@/features/vote/fetch-vote-detail/model/useVoteDetail';
import { useVoteParticipant } from '@/features/vote/participate-vote/model/useVoteParticipant';
import { useCreateVote } from '@/features/vote/create-vote/model/useCreateVote';
import CreateVoteModal from '@/features/vote/create-vote/ui/CreateVoteModal';
import './VotePanel.css';

/**
 * 투표 패널 컴포넌트
 */
const VotePanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: votes, loading, error, refetch: refetchVoteList } = useVoteList(roomId, 'OPEN');
  const { data: voteDetail, loading: detailLoading, error: detailError, refetch: refetchVoteDetail } = useVoteDetail(
    roomId,
    selectedVoteId,
  );
  const { run: participateVote, loading: participateLoading } = useVoteParticipant();
  const { run: createVote } = useCreateVote();

  const handleCreateVote = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateVoteSubmit = async (title: string, options: string[]) => {
    if (!roomId) return;

    try {
      await createVote(roomId, { title, options });
      // 투표 생성 성공 후 목록 새로고침
      await refetchVoteList();
    } catch (error) {
      console.error('투표 생성 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  const handleVoteCardClick = (voteId: number) => {
    setSelectedVoteId(voteId);
  };

  const handleBackToList = () => {
    setSelectedVoteId(null);
  };

  const handleOptionClick = async (optionId: number) => {
    if (!roomId || !selectedVoteId || participateLoading) {
      return;
    }

    try {
      await participateVote(roomId, selectedVoteId, { option_id: optionId });
      // 투표 성공 후 상세 정보 다시 불러오기
      await refetchVoteDetail();
    } catch (error) {
      console.error('투표 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  // 투표 상세 화면
  if (selectedVoteId !== null) {
    const totalVotes = voteDetail
      ? voteDetail.options.reduce((sum, option) => sum + option.vote_count, 0)
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
        ) : detailError ? (
          <div className="vote-error">
            <p>투표 상세를 불러오는데 실패했습니다.</p>
          </div>
        ) : voteDetail ? (
          <>
            <div className="vote-detail-options">
              {voteDetail.options.map((option) => {
                const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                const isSelected = voteDetail.my_selected_option_id === option.option_id;
                const isClosed = voteDetail.status === 'CLOSED';
                
                return (
                  <div
                    key={option.option_id}
                    className={`vote-detail-option ${isSelected ? 'selected' : ''} ${isClosed ? 'disabled' : ''}`}
                    onClick={() => !isClosed && handleOptionClick(option.option_id)}
                    role={isClosed ? 'presentation' : 'button'}
                    tabIndex={isClosed ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!isClosed && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleOptionClick(option.option_id);
                      }
                    }}
                  >
                    <div className="vote-option-row">
                      <span className="vote-option-content">{option.content}</span>
                      <span className="vote-option-count">
                        {option.vote_count}표 ({Math.round(percentage)}%)
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

            <button className="vote-back-button" onClick={handleBackToList}>
              투표목록으로 가기
            </button>
          </>
        ) : null}
      </div>
    );
  }

  // 투표 목록 화면
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
                  key={vote.vote_id}
                  className="vote-card"
                  onClick={() => handleVoteCardClick(vote.vote_id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleVoteCardClick(vote.vote_id);
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
          
          <button className="vote-create-button" onClick={handleCreateVote}>
            + 새 투표 생성하기
          </button>
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
