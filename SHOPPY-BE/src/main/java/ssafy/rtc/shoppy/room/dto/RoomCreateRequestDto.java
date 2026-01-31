package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RoomCreateRequestDto(

        @NotBlank
        String roomName,

        @NotNull
        @Positive
        BigDecimal targetBudget,

        @NotNull
        @Valid
        RoomMetaDto roomMeta
) {
}
