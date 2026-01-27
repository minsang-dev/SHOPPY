package ssafy.rtc.shoppy.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.vote.domain.VoteOption;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "VoteOption")
public class VoteOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long optionId;

    @Column(name = "vote_id", nullable = false)
    private Long voteId;

    @Column(name = "content", nullable = false)
    private String content;

    public VoteOptionEntity(Long optionId, Long voteId, String content) {
        this.optionId = optionId;
        this.voteId = voteId;
        this.content = content;
    }

    public VoteOption toDomain() {
        return VoteOption.from(this.optionId, this.voteId, this.content);
    }

    public static VoteOptionEntity fromDomain(VoteOption option) {
        return new VoteOptionEntity(
                option.getOptionId(),
                option.getVoteId(),
                option.getContent()
        );
    }
}
