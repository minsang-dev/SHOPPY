package ssafy.rtc.shoppy.ai.llm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record AiRoomCreateRequestDto(
        @NotNull
        @Valid
        RoomMetaRequestDto roomMeta,

        @NotNull
        @Valid
        RoomConstraintsRequestDto roomConstraints
) {
}
