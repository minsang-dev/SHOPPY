package ssafy.rtc.shoppy.vote.domain;

import lombok.Getter;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;

@Getter
public class Vote {

    private final Long voteId;
    private final Long roomId;
    private final String title;
    private final VoteStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime closedAt;

    private Vote(
            Long voteId,
            Long roomId,
            String title,
            VoteStatus status,
            LocalDateTime createdAt,
            LocalDateTime closedAt
    ) {
        this.voteId = voteId;
        this.roomId = roomId;
        this.title = title;
        this.status = status;
        this.createdAt = createdAt;
        this.closedAt = closedAt;
    }

    public static Vote create(Long roomId, String title) {
        return new Vote(null, roomId, title, VoteStatus.OPEN, null, null);
    }

    public static Vote from(
            Long voteId,
            Long roomId,
            String title,
            VoteStatus status,
            LocalDateTime createdAt,
            LocalDateTime closedAt
    ) {
        return new Vote(voteId, roomId, title, status, createdAt, closedAt);
    }

    public Vote close() {
        return new Vote(
                this.voteId,
                this.roomId,
                this.title,
                VoteStatus.CLOSED,
                this.createdAt,
                LocalDateTime.now()
        );
    }

    public boolean isOpen() {
        return this.status == VoteStatus.OPEN;
    }
}
