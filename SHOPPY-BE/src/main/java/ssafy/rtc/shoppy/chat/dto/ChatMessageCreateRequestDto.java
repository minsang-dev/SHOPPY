package ssafy.rtc.shoppy.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageCreateRequestDto(
        @NotBlank(message = "메시지 내용은 필수입니다")
        @Size(min = 1, max = 500, message = "메시지는 1자 이상 500자 이하여야 합니다")
        String content
) {
}
