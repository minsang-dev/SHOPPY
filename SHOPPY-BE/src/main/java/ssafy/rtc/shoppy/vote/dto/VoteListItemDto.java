package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;

public record VoteListItemDto(
        Long voteId,
        String title,
        VoteStatus status,
        LocalDateTime createdAt,
        LocalDateTime closedAt
) {
    public static VoteListItemDto from(Vote vote) {
        return new VoteListItemDto(
                vote.getVoteId(),
                vote.getTitle(),
                vote.getStatus(),
                vote.getCreatedAt(),
                vote.getClosedAt()
        );
    }
}
