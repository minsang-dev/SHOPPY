package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.VoteParticipant;

public record VoteParticipateResponseDto(
        Long voteParticipantId,
        Long voteId,
        Long optionId,
        Long userId
) {
    public static VoteParticipateResponseDto from(VoteParticipant participant) {
        return new VoteParticipateResponseDto(
                participant.getVoteParticipantId(),
                participant.getVoteId(),
                participant.getOptionId(),
                participant.getUserId()
        );
    }
}
