export type RoomModalTab = 'create' | 'join';

export interface DesktopRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 쇼핑 목적 (purpose) 허용 값
export type ShoppingPurpose = 'TRAVEL' | 'MT' | 'PARTY' | 'CAMPING' | 'DAILY' | 'GIFT';

// 관심 카테고리 허용 값
export type InterestCategory =
  | 'FOOD_READY'
  | 'MEAT_RAW'
  | 'VEGETABLE_RAW'
  | 'FRESH_READY'
  | 'DRINK_NON_ALCOHOL'
  | 'ALCOHOL'
  | 'SNACK'
  | 'COOKING_TOOL'
  | 'SUPPLY';

/** 관심 카테고리 전체 목록 (기본값: 전부 선택) */
export const ALL_INTEREST_CATEGORIES: InterestCategory[] = [
  'FOOD_READY',
  'MEAT_RAW',
  'VEGETABLE_RAW',
  'FRESH_READY',
  'DRINK_NON_ALCOHOL',
  'ALCOHOL',
  'SNACK',
  'COOKING_TOOL',
  'SUPPLY',
];

// 특성(traits) 허용 값
export type ShoppingTrait =
  | 'VALUE'
  | 'PREMIUM'
  | 'BULK'
  | 'MINIMAL'
  | 'BALANCED'
  | 'ALCOHOL_YES'
  | 'ALCOHOL_NO'
  | 'EASY_COOK'
  | 'MEAT_LOVER'
  | 'VEGGIE'
  | 'OUTDOOR'
  | 'INDOOR'
  | 'COOKING_OK'
  | 'COOKING_AVAILABLE'
  | 'NO_COOKING'
  | 'MEAL_MAIN'
  | 'SNACK_MAIN'
  | 'VARIETY_OK'
  | 'CONSUMABLE'
  | 'EQUIPMENT'
  | 'TOOL';

// 상호 배타 조합 정의
export const MUTUALLY_EXCLUSIVE_TRAITS: [ShoppingTrait, ShoppingTrait][] = [
  ['VALUE', 'PREMIUM'],
  ['BULK', 'MINIMAL'],
  ['ALCOHOL_YES', 'ALCOHOL_NO'],
  ['OUTDOOR', 'INDOOR'],
  ['COOKING_OK', 'NO_COOKING'],
  ['COOKING_AVAILABLE', 'NO_COOKING'],
];

export interface CreateRoomFormData {
  title: string;
  purpose: ShoppingPurpose | '';
  categories: InterestCategory[];
  traits: ShoppingTrait[];
  participants: number;
  targetBudget: string;
  minBudget: number;
}

export interface JoinRoomFormData {
  nickname: string;
  entryLink: string;
}
