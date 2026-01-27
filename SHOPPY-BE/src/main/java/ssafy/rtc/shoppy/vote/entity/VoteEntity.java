package ssafy.rtc.shoppy.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "Vote")
public class VoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Long voteId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 10)
    private VoteStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    public VoteEntity(
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

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = VoteStatus.OPEN;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Vote toDomain() {
        return Vote.from(
                this.voteId,
                this.roomId,
                this.title,
                this.status,
                this.createdAt,
                this.closedAt
        );
    }

    public static VoteEntity fromDomain(Vote vote) {
        return new VoteEntity(
                vote.getVoteId(),
                vote.getRoomId(),
                vote.getTitle(),
                vote.getStatus(),
                vote.getCreatedAt(),
                vote.getClosedAt()
        );
    }
}
