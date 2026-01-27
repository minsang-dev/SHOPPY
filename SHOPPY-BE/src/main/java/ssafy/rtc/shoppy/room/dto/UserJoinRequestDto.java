package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.NotBlank;

public record UserJoinRequestDto(
        @NotBlank(message = "방 코드는 필수입니다.")
        String roomCode
) {
}
