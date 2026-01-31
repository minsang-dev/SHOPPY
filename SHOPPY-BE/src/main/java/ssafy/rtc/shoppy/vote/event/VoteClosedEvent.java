package ssafy.rtc.shoppy.vote.event;

import ssafy.rtc.shoppy.vote.dto.VoteCloseResponseDto;

public record VoteClosedEvent(Long roomId, VoteCloseResponseDto response) {
}
