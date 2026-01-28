export type VoteStatus = 'OPEN' | 'CLOSED';

export interface Vote {
  voteId: number;
  title: string;
  status: VoteStatus;
  createdAt: string;
  closedAt: string | null;
}

export interface VoteOption {
  optionId: number;
  content: string;
  voteCount: number;
}

export interface VoteDetail {
  voteId: number;
  roomId: number;
  title: string;
  status: VoteStatus;
  createdAt: string;
  closedAt: string | null;
  options: VoteOption[];
  mySelectedOptionId: number | null;
}

export interface VoteListResponse {
  status: string;
  message: string;
  data: {
    items: Vote[];
  };
}

export interface VoteParticipantRequest {
  optionId: number;
}

export interface VoteParticipantResponse {
  voteParticipantId: number;
  voteId: number;
  optionId: number;
  userId: number;
}

export interface CreateVoteRequest {
  title: string;
  options: string[];
}

export interface CreateVoteResponse {
  voteId: number;
  roomId: number;
  title: string;
  status: VoteStatus;
  createdAt: string;
  closedAt: string | null;
  options: Array<{
    optionId: number;
    content: string;
  }>;
}
