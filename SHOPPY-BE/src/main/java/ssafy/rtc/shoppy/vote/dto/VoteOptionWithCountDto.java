package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.VoteOption;

public record VoteOptionWithCountDto(
        Long optionId,
        String content,
        long voteCount
) {
    public static VoteOptionWithCountDto from(VoteOption option, long voteCount) {
        return new VoteOptionWithCountDto(option.getOptionId(), option.getContent(), voteCount);
    }
}
