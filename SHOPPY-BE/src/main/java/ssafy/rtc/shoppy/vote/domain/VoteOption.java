package ssafy.rtc.shoppy.vote.domain;

import lombok.Getter;

@Getter
public class VoteOption {

    private final Long optionId;
    private final Long voteId;
    private final String content;

    private VoteOption(Long optionId, Long voteId, String content) {
        this.optionId = optionId;
        this.voteId = voteId;
        this.content = content;
    }

    public static VoteOption create(Long voteId, String content) {
        return new VoteOption(null, voteId, content);
    }

    public static VoteOption from(Long optionId, Long voteId, String content) {
        return new VoteOption(optionId, voteId, content);
    }
}
