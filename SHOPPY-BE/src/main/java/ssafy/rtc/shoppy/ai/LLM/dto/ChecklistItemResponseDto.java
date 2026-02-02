package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChecklistItemResponseDto(
        @JsonProperty("checklist_item_id")
        Long checklistItemId,
        String name,
        @JsonProperty("item_size")
        String itemSize,
        boolean checked,
        String reason,
        Integer sortOrder
) {
}
