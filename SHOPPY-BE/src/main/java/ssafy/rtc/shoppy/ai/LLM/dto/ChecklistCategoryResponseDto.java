package ssafy.rtc.shoppy.ai.llm.dto;

import java.util.List;

public record ChecklistCategoryResponseDto(
        String code,
        String label,
        List<ChecklistItemResponseDto> items
) {
}
