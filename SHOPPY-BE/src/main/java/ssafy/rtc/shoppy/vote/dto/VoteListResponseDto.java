package ssafy.rtc.shoppy.vote.dto;

import ssafy.rtc.shoppy.vote.domain.Vote;

import java.util.List;

public record VoteListResponseDto(
        List<VoteListItemDto> items
) {
    public static VoteListResponseDto from(List<Vote> votes) {
        List<VoteListItemDto> items = votes.stream()
                .map(VoteListItemDto::from)
                .toList();

        return new VoteListResponseDto(items);
    }
}
