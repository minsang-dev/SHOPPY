package ssafy.rtc.shoppy.ai.llm.service.model;

public record ChecklistCandidate(
        String categoryCode,
        String itemName,
        int priority
) {
}
