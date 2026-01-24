export type RoomModalTab = 'create' | 'join';

export interface DesktopRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateRoomFormData {
  title: string;
  purpose: string;
  category: string;
  participants: number;
  targetBudget: string;
  minBudget: number;
  mode: 'personal' | 'host';
}

export interface JoinRoomFormData {
  nickname: string;
  entryLink: string;
}
