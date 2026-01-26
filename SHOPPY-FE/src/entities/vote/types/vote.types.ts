export type VoteStatus = 'OPEN' | 'CLOSED';

export interface Vote {
  vote_id: number;
  title: string;
  status: VoteStatus;
  created_at: string;
  closed_at: string | null;
}

export interface VoteOption {
  option_id: number;
  content: string;
  vote_count: number;
}

export interface VoteDetail {
  vote_id: number;
  room_id: number;
  title: string;
  status: VoteStatus;
  created_at: string;
  closed_at: string | null;
  options: VoteOption[];
  my_selected_option_id: number | null;
}

export interface VoteListResponse {
  status: string;
  message: string;
  data: {
    items: Vote[];
  };
}

export interface VoteParticipantRequest {
  option_id: number;
}

export interface VoteParticipantResponse {
  vote_participant_id: number;
  vote_id: number;
  option_id: number;
  user_id: number;
}

export interface CreateVoteRequest {
  title: string;
  options: string[];
}

export interface CreateVoteResponse {
  vote_id: number;
  room_id: number;
  title: string;
  status: VoteStatus;
  created_at: string;
  closed_at: string | null;
  options: Array<{
    option_id: number;
    content: string;
  }>;
}
