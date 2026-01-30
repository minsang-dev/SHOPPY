package ssafy.rtc.shoppy.ai.llm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

public record RoomMetaRequestDto(
        @NotBlank
        String roomName,

        @NotBlank
        String type,

        @NotNull
        @PositiveOrZero
        BigDecimal targetBudget,

        @NotNull
        @PositiveOrZero
        BigDecimal minBudget
) {
}
