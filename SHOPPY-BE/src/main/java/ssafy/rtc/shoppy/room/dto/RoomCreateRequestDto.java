package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

public record RoomCreateRequestDto(

        @NotBlank
        String roomName,

        @NotNull
        @Positive
        BigDecimal targetBudget,

        @NotNull
        SyncMode syncMode,

        @NotNull
        @Valid
        RoomMetaDto roomMeta
) {
}
