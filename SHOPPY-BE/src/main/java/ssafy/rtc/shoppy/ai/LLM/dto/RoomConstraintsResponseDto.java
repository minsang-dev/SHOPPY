package ssafy.rtc.shoppy.ai.llm.dto;

import java.util.List;

public record RoomConstraintsResponseDto(
        String purpose,
        int peopleCount,
        List<String> interestCategories,
        List<String> traits
) {
}
