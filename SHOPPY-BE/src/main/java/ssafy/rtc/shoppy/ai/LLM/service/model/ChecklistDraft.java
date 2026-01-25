package ssafy.rtc.shoppy.ai.llm.service.model;

import java.util.List;

public record ChecklistDraft(
        List<ChecklistCategoryDraft> categories
) {
}
