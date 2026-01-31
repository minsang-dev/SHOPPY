package ssafy.rtc.shoppy.vote.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import ssafy.rtc.shoppy.vote.dto.VoteCreateRequestDto;
import ssafy.rtc.shoppy.vote.dto.VoteParticipateRequestDto;
import ssafy.rtc.shoppy.vote.service.VoteService;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class VoteWebSocketController {

    private final VoteService voteService;

    @MessageMapping("/rooms/{roomId}/votes/create")
    public void createVote(
            @DestinationVariable Long roomId,
            VoteCreateRequestDto request,
            Principal principal
    ) {
        Long userId = extractUserId(principal);
        if (userId == null) {
            return;
        }

        log.info("WebSocket vote create request - roomId: {}, userId: {}", roomId, userId);
        voteService.createVote(roomId, userId, request);
    }

    @MessageMapping("/rooms/{roomId}/votes/{voteId}/participate")
    public void participateVote(
            @DestinationVariable Long roomId,
            @DestinationVariable Long voteId,
            VoteParticipateRequestDto request,
            Principal principal
    ) {
        Long userId = extractUserId(principal);
        if (userId == null) {
            return;
        }

        log.info("WebSocket vote participate request - roomId: {}, voteId: {}, userId: {}", roomId, voteId, userId);
        voteService.participate(roomId, voteId, userId, request);
    }

    @MessageMapping("/rooms/{roomId}/votes/{voteId}/close")
    public void closeVote(
            @DestinationVariable Long roomId,
            @DestinationVariable Long voteId,
            Principal principal
    ) {
        Long userId = extractUserId(principal);
        if (userId == null) {
            return;
        }

        log.info("WebSocket vote close request - roomId: {}, voteId: {}, userId: {}", roomId, voteId, userId);
        voteService.closeVote(roomId, voteId, userId);
    }

    private Long extractUserId(Principal principal) {
        if (principal == null) {
            log.error("WebSocket message without authentication");
            return null;
        }

        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            log.error("Invalid principal name format, expected numeric userId but got: {}", principal.getName());
            return null;
        }
    }
}
