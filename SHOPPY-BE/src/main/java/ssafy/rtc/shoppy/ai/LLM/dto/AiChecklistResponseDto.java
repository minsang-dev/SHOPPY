package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public record AiChecklistResponseDto(
        @JsonProperty("checklist_id")
        Long checklistId,
        @JsonProperty("generated_at")
        LocalDateTime generatedAt,
        List<ChecklistCategoryResponseDto> categories
) {
}
