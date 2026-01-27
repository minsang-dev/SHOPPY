package ssafy.rtc.shoppy.ai.llm.service.model;

import java.util.List;

public record ChecklistCategoryDraft(
        String code,
        List<ChecklistItemDraft> items
) {
}
