package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.NotBlank;

public record GuestJoinRequestDto(
        @NotBlank(message = "방 코드는 필수입니다.")
        String roomCode,

        @NotBlank(message = "닉네임은 필수입니다.")
        String nickname
) {
}
