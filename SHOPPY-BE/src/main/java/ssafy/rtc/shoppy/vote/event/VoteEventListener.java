package ssafy.rtc.shoppy.vote.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class VoteEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVoteCreated(VoteCreatedEvent event) {
        log.debug("Publishing vote created event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + event.roomId() + "/votes/created",
                event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVoteParticipated(VoteParticipatedEvent event) {
        log.debug("Publishing vote participated event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + event.roomId() + "/votes/participated",
                event.voteDetail()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVoteClosed(VoteClosedEvent event) {
        log.debug("Publishing vote closed event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + event.roomId() + "/votes/closed",
                event.response()
        );
    }
}
