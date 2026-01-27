package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.domain.VoteOption;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;
import java.util.List;

public record VoteCreateResponseDto(
        Long voteId,
        Long roomId,
        String title,
        VoteStatus status,
        LocalDateTime createdAt,
        List<VoteOptionDto> options
) {
    public static VoteCreateResponseDto from(Vote vote, List<VoteOption> options) {
        List<VoteOptionDto> optionDtos = options.stream()
                .map(VoteOptionDto::from)
                .toList();

        return new VoteCreateResponseDto(
                vote.getVoteId(),
                vote.getRoomId(),
                vote.getTitle(),
                vote.getStatus(),
                vote.getCreatedAt(),
                optionDtos
        );
    }
}
