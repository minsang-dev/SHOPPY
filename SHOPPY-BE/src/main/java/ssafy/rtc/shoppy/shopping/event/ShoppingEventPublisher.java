package ssafy.rtc.shoppy.shopping.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemDeleteResponseDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemResponseDto;

@Component
@RequiredArgsConstructor
public class ShoppingEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishItemAdded(Long roomId, ShoppingItemResponseDto item) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/shopping/added",
                item
        );
    }

    public void publishItemUpdated(Long roomId, ShoppingItemResponseDto item) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/shopping/updated",
                item
        );
    }

    public void publishItemDeleted(Long roomId, Long shoppingItemId) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/shopping/deleted",
                new ShoppingItemDeleteResponseDto(shoppingItemId)
        );
    }
}
