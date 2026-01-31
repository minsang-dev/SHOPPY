package ssafy.rtc.shoppy.vote.event;

import ssafy.rtc.shoppy.vote.dto.VoteDetailResponseDto;

public record VoteParticipatedEvent(Long roomId, VoteDetailResponseDto voteDetail) {
}
