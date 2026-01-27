package ssafy.rtc.shoppy.vote.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class VoteParticipant {

    private final Long voteParticipantId;
    private final Long voteId;
    private final Long optionId;
    private final Long userId;
    private final LocalDateTime votedAt;

    private VoteParticipant(
            Long voteParticipantId,
            Long voteId,
            Long optionId,
            Long userId,
            LocalDateTime votedAt
    ) {
        this.voteParticipantId = voteParticipantId;
        this.voteId = voteId;
        this.optionId = optionId;
        this.userId = userId;
        this.votedAt = votedAt;
    }

    public static VoteParticipant create(Long voteId, Long optionId, Long userId) {
        return new VoteParticipant(null, voteId, optionId, userId, null);
    }

    public static VoteParticipant from(
            Long voteParticipantId,
            Long voteId,
            Long optionId,
            Long userId,
            LocalDateTime votedAt
    ) {
        return new VoteParticipant(voteParticipantId, voteId, optionId, userId, votedAt);
    }
}
