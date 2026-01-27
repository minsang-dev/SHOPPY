package ssafy.rtc.shoppy.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.vote.domain.VoteParticipant;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "VoteParticipant", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"vote_id", "user_id"})
})
public class VoteParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_participant_id")
    private Long voteParticipantId;

    @Column(name = "vote_id", nullable = false)
    private Long voteId;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "voted_at")
    private LocalDateTime votedAt;

    public VoteParticipantEntity(
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

    @PrePersist
    public void prePersist() {
        if (this.votedAt == null) {
            this.votedAt = LocalDateTime.now();
        }
    }

    public VoteParticipant toDomain() {
        return VoteParticipant.from(
                this.voteParticipantId,
                this.voteId,
                this.optionId,
                this.userId,
                this.votedAt
        );
    }

    public static VoteParticipantEntity fromDomain(VoteParticipant participant) {
        return new VoteParticipantEntity(
                participant.getVoteParticipantId(),
                participant.getVoteId(),
                participant.getOptionId(),
                participant.getUserId(),
                participant.getVotedAt()
        );
    }
}
