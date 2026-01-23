package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.NotNull;

public record RoomMemberStateUpdateRequestDto(
        @NotNull
        Boolean isCameraOn
) {
}
