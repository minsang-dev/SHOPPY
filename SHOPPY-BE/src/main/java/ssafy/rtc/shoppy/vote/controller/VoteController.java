package ssafy.rtc.shoppy.vote.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.vote.dto.*;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;
import ssafy.rtc.shoppy.vote.service.VoteService;

@RestController
@RequestMapping("/rooms/{roomId}/votes")
@RequiredArgsConstructor
@Tag(name = "Vote API", description = "투표 관리 API")
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    @Operation(summary = "투표 생성", description = "호스트가 새로운 투표를 생성합니다.")
    public ResponseEntity<SuccessResponse<VoteCreateResponseDto>> createVote(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @Valid @RequestBody VoteCreateRequestDto request
    ) {
        VoteCreateResponseDto response = voteService.createVote(roomId, userId, request);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @GetMapping
    @Operation(summary = "투표 목록 조회", description = "방의 투표 목록을 조회합니다.")
    public ResponseEntity<SuccessResponse<VoteListResponseDto>> getVoteList(
            @PathVariable Long roomId,
            @RequestParam(required = false) VoteStatus status
    ) {
        VoteListResponseDto response = voteService.getVoteList(roomId, status);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @GetMapping("/{voteId}")
    @Operation(summary = "투표 상세 조회", description = "투표 상세 정보를 조회합니다.")
    public ResponseEntity<SuccessResponse<VoteDetailResponseDto>> getVoteDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PathVariable Long voteId
    ) {
        VoteDetailResponseDto response = voteService.getVoteDetail(roomId, voteId, userId);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @PostMapping("/{voteId}/participants")
    @Operation(summary = "투표 하기", description = "멤버가 투표에 참여합니다.")
    public ResponseEntity<SuccessResponse<VoteParticipateResponseDto>> participate(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PathVariable Long voteId,
            @Valid @RequestBody VoteParticipateRequestDto request
    ) {
        VoteParticipateResponseDto response = voteService.participate(roomId, voteId, userId, request);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @PostMapping("/{voteId}/close")
    @Operation(summary = "투표 마감", description = "호스트가 투표를 마감합니다.")
    public ResponseEntity<SuccessResponse<VoteCloseResponseDto>> closeVote(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PathVariable Long voteId
    ) {
        VoteCloseResponseDto response = voteService.closeVote(roomId, voteId, userId);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }
}
