package ssafy.rtc.shoppy.ai.llm.service.model;

import java.math.BigDecimal;
import java.util.List;

public record AiChecklistInput(
        String purpose,
        int peopleCount,
        BigDecimal minBudget,
        BigDecimal targetBudget,
        List<String> interestCategories,
        List<String> traits,
        List<ChecklistCandidate> candidates
) {
}
