package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiChecklistItemDeletedDto(
        @JsonProperty("checklist_item_id") Long checklistItemId
) {
}
