package ssafy.rtc.shoppy.vote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record VoteCreateRequestDto(
        @NotBlank(message = "투표 제목은 필수입니다.")
        String title,

        @NotEmpty(message = "투표 항목은 최소 1개 이상이어야 합니다.")
        @Size(min = 2, message = "투표 항목은 최소 2개 이상이어야 합니다.")
        List<String> options
) {
}
