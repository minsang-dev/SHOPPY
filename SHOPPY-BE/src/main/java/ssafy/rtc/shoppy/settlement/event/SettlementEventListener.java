package ssafy.rtc.shoppy.settlement.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettlementEventListener {
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReceiptUploaded(ReceiptUploadedEvent event) {
        log.debug("Publishing receipt uploaded event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSettlementCreated(SettlementCreatedEvent event) {
        log.debug("Publishing settlement created event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleItemAdded(SettlementItemAddedEvent event) {
        log.debug("Publishing item added event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleItemUpdated(SettlementItemUpdatedEvent event) {
        log.debug("Publishing item updated event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleItemDeleted(SettlementItemDeletedEvent event) {
        log.debug("Publishing item deleted event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSettlementCompleted(SettlementCompletedEvent event) {
        log.debug("Publishing settlement completed event for roomId: {}", event.roomId());
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + event.roomId() + "/settlements",
            event.response()
        );
    }
}
