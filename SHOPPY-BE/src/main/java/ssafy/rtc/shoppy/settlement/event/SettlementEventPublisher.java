package ssafy.rtc.shoppy.settlement.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.settlement.dto.*;

@Component
@RequiredArgsConstructor
public class SettlementEventPublisher {
    private final ApplicationEventPublisher applicationEventPublisher;

    public void publishReceiptUploaded(Long roomId, ReceiptUploadResponseEvent response) {
        applicationEventPublisher.publishEvent(new ReceiptUploadedEvent(roomId, response));
    }

    public void publishSettlementCreated(Long roomId, SettlementCreatedResponseEvent response) {
        applicationEventPublisher.publishEvent(new SettlementCreatedEvent(roomId, response));
    }

    public void publishItemAdded(Long roomId, SettlementItemAddedResponseEvent response) {
        applicationEventPublisher.publishEvent(new SettlementItemAddedEvent(roomId, response));
    }

    public void publishItemUpdated(Long roomId, SettlementItemUpdatedResponseEvent response) {
        applicationEventPublisher.publishEvent(new SettlementItemUpdatedEvent(roomId, response));
    }

    public void publishSettlementCompleted(Long roomId, SettlementCompletedResponseEvent response) {
        applicationEventPublisher.publishEvent(new SettlementCompletedEvent(roomId, response));
    }
}
