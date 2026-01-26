package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;

public record VoteCloseResponseDto(
        Long voteId,
        VoteStatus status,
        LocalDateTime closedAt
) {
    public static VoteCloseResponseDto from(Vote vote) {
        return new VoteCloseResponseDto(
                vote.getVoteId(),
                vote.getStatus(),
                vote.getClosedAt()
        );
    }
}
