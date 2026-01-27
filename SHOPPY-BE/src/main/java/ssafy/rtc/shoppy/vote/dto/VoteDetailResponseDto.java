package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;
import java.util.List;

public record VoteDetailResponseDto(
        Long voteId,
        Long roomId,
        String title,
        VoteStatus status,
        LocalDateTime createdAt,
        LocalDateTime closedAt,
        List<VoteOptionWithCountDto> options,
        Long mySelectedOptionId
) {
    public static VoteDetailResponseDto from(
            Vote vote,
            List<VoteOptionWithCountDto> options,
            Long mySelectedOptionId
    ) {
        return new VoteDetailResponseDto(
                vote.getVoteId(),
                vote.getRoomId(),
                vote.getTitle(),
                vote.getStatus(),
                vote.getCreatedAt(),
                vote.getClosedAt(),
                options,
                mySelectedOptionId
        );
    }
}
