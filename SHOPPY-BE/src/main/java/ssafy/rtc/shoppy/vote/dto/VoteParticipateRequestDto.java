package ssafy.rtc.shoppy.vote.dto;

import jakarta.validation.constraints.NotNull;

public record VoteParticipateRequestDto(
        @NotNull(message = "투표 항목 ID는 필수입니다.")
        Long optionId
) {
}
