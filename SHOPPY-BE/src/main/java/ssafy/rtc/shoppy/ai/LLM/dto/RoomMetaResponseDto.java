package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import ssafy.rtc.shoppy.room.enums.RoomStatus;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

public record RoomMetaResponseDto(
        String roomName,
        @JsonProperty("room_code")
        String roomCode,
        RoomStatus status,
        String type,
        @JsonProperty("target_budget")
        BigDecimal targetBudget,
        @JsonProperty("min_budget")
        BigDecimal minBudget,
        @JsonProperty("sync_mode")
        SyncMode syncMode
) {
}
