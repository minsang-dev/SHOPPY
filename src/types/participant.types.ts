/**
 * 참여자 정보 타입
 */
export interface Participant {
  member_id: number;
  room_id: number;
  user_id: number | null;
  name: string;
  role: 'HOST' | 'GUEST';
  status: 'ACTIVE' | 'INACTIVE';
  is_camera_on: boolean;
  current_cursor_x: number | null;
  current_cursor_y: number | null;
  joined_at: string;
}

/**
 * 정산 참여자 선택 타입
 */
export type ParticipantSelectionStatus = 'checked' | 'unchecked';
