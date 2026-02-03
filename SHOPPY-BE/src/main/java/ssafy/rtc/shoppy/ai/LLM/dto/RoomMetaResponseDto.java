package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import ssafy.rtc.shoppy.room.enums.RoomStatus;

import java.math.BigDecimal;

public record RoomMetaResponseDto(
        String roomName,
        @JsonProperty("room_code")
        String roomCode,
        RoomStatus status,
        String purpose,
        @JsonProperty("target_budget")
        BigDecimal targetBudget,
        @JsonProperty("min_budget")
        BigDecimal minBudget
) {
}
