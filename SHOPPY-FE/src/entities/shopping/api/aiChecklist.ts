import { apiGet, apiPatch, apiDelete } from '@/shared/api/utils';

// AI 체크리스트 아이템 타입
export interface AiChecklistItem {
  checklistItemId: number;
  name: string;
  itemSize: string | null;
  checked: boolean;
  reason: string | null;
  sortOrder: number | null;
}

// AI 체크리스트 카테고리 타입
export interface AiChecklistCategory {
  code: string;
  label: string;
  items: AiChecklistItem[];
}

// AI 체크리스트 응답 타입
export interface AiChecklistResponse {
  checklistId: number;
  generatedAt: string;
  categories: AiChecklistCategory[];
}

// 백엔드 응답 (snake_case)
interface AiChecklistItemRaw {
  checklist_item_id: number;
  name: string;
  item_size: string | null;
  checked: boolean;
  reason: string | null;
  sortOrder: number | null;
}

interface AiChecklistCategoryRaw {
  code: string;
  label: string;
  items: AiChecklistItemRaw[];
}

interface AiChecklistResponseRaw {
  checklist_id: number;
  generated_at: string;
  categories: AiChecklistCategoryRaw[];
}

// 변환 함수
const toAiChecklistItem = (raw: AiChecklistItemRaw): AiChecklistItem => ({
  checklistItemId: raw.checklist_item_id,
  name: raw.name,
  itemSize: raw.item_size,
  checked: raw.checked,
  reason: raw.reason,
  sortOrder: raw.sortOrder,
});

const toAiChecklistCategory = (raw: AiChecklistCategoryRaw): AiChecklistCategory => ({
  code: raw.code,
  label: raw.label,
  items: raw.items.map(toAiChecklistItem),
});

const toAiChecklistResponse = (raw: AiChecklistResponseRaw): AiChecklistResponse => ({
  checklistId: raw.checklist_id,
  generatedAt: raw.generated_at,
  categories: raw.categories.map(toAiChecklistCategory),
});

// AI 체크리스트 조회
export const getAiChecklist = async (roomId: string): Promise<AiChecklistResponse> => {
  const res = await apiGet<AiChecklistResponseRaw>(`/rooms/${roomId}/ai-checklist`);
  return toAiChecklistResponse(res);
};

// AI 체크리스트 아이템 체크 토글
export const toggleAiChecklistItem = async (
  roomId: string,
  checklistItemId: number,
  checked: boolean,
): Promise<void> => {
  await apiPatch<void>(`/rooms/${roomId}/ai-checklist/items/${checklistItemId}`, { checked });
};

// AI 체크리스트 아이템 삭제
export const deleteAiChecklistItem = async (
  roomId: string,
  checklistItemId: number,
): Promise<void> => {
  await apiDelete<void>(`/rooms/${roomId}/ai-checklist/items/${checklistItemId}`);
};
