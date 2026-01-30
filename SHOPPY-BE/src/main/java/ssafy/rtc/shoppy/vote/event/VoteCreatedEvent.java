package ssafy.rtc.shoppy.vote.event;

import ssafy.rtc.shoppy.vote.dto.VoteCreateResponseDto;

public record VoteCreatedEvent(Long roomId, VoteCreateResponseDto response) {
}
