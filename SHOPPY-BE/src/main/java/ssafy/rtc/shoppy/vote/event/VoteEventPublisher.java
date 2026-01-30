package ssafy.rtc.shoppy.vote.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.vote.dto.VoteCloseResponseDto;
import ssafy.rtc.shoppy.vote.dto.VoteCreateResponseDto;
import ssafy.rtc.shoppy.vote.dto.VoteDetailResponseDto;

@Component
@RequiredArgsConstructor
public class VoteEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishVoteCreated(Long roomId, VoteCreateResponseDto vote) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/votes/created",
                vote
        );
    }

    public void publishVoteParticipated(Long roomId, VoteDetailResponseDto voteDetail) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/votes/participated",
                voteDetail
        );
    }

    public void publishVoteClosed(Long roomId, VoteCloseResponseDto vote) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/votes/closed",
                vote
        );
    }
}
