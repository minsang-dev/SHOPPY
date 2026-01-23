package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.NotBlank;

public record RoomHostUrlUpdateRequestDto(
        @NotBlank
        String currentUrl
) {
}
