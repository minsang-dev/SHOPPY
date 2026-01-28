import type { Room, Member, ChatMessage } from '../types';

// Mock Room 데이터
export const mockRoom: Room = {
  roomId: 1,
  hostId: 1,
  roomName: '테스트 쇼핑룸',
  inviteCode: 'TEST123',
  roomStatus: 'ACTIVE',
  targetBudget: 100000,
  syncMode: 'FOLLOW',
  hostCurrentUrl: null,
  roomMeta: {
    shoppingPurpose: '생일 선물 구매',
    interestCategories: ['패션', '뷰티'],
    headcount: 4,
    budgetMin: 50000,
  },
};

// Mock Members 데이터
export const mockMembers: Member[] = [
  {
    memberId: 1,
    roomId: 1,
    userId: 1,
    nickname: '호스트',
    role: 'HOST',
    status: 'ACTIVE',
    isCameraOn: true,
    joinedAt: new Date().toISOString(),
  },
  {
    memberId: 2,
    roomId: 1,
    userId: null,
    nickname: '게스트1',
    role: 'GUEST',
    status: 'ACTIVE',
    isCameraOn: false,
    joinedAt: new Date().toISOString(),
  },
];

// Mock Chat Messages 데이터
export const mockChatMessages: ChatMessage[] = [
  {
    chatMessageId: 1,
    senderId: 1,
    senderName: '호스트',
    message: '안녕하세요! 쇼핑룸에 오신 것을 환영합니다.',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    chatMessageId: 2,
    senderId: 2,
    senderName: '게스트1',
    message: '안녕하세요~',
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
];

// 새 채팅 메시지 ID 생성용
let chatMessageIdCounter = 3;

export const createMockChatMessage = (
  senderId: number,
  senderName: string,
  message: string,
): ChatMessage => ({
  chatMessageId: chatMessageIdCounter++,
  senderId,
  senderName,
  message,
  createdAt: new Date().toISOString(),
});

// 새 멤버 ID 생성용
let memberIdCounter = 3;

export const createMockMember = (nickname: string, role: 'HOST' | 'GUEST' = 'GUEST'): Member => ({
  memberId: memberIdCounter++,
  roomId: 1,
  userId: role === 'HOST' ? memberIdCounter : null,
  nickname,
  role,
  status: 'ACTIVE',
  isCameraOn: false,
  joinedAt: new Date().toISOString(),
});
