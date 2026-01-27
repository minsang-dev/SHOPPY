package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.VoteOption;

public record VoteOptionDto(
        Long optionId,
        String content
) {
    public static VoteOptionDto from(VoteOption option) {
        return new VoteOptionDto(option.getOptionId(), option.getContent());
    }
}
