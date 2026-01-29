package ssafy.rtc.shoppy.shopping.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemDeleteRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemUpdateRequestDto;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ShoppingWebSocketController {

    private final ShoppingService shoppingService;

    @MessageMapping("/rooms/{roomId}/shopping/add")
    public void addShoppingItem(
            @DestinationVariable Long roomId,
            ShoppingItemAddRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            log.error("WebSocket message without authentication");
            return;
        }

        Long userId = Long.parseLong(principal.getName());
        log.info("WebSocket shopping item add request - roomId: {}, userId: {}", roomId, userId);

        shoppingService.addShoppingItem(roomId, request);
    }

    @MessageMapping("/rooms/{roomId}/shopping/update/{shoppingItemId}")
    public void updateShoppingItem(
            @DestinationVariable Long roomId,
            @DestinationVariable Long shoppingItemId,
            ShoppingItemUpdateRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            log.error("WebSocket message without authentication");
            return;
        }

        Long userId = Long.parseLong(principal.getName());
        log.info("WebSocket shopping item update request - roomId: {}, itemId: {}, userId: {}",
                roomId, shoppingItemId, userId);

        shoppingService.updateShoppingItem(roomId, shoppingItemId, request);
    }

    @MessageMapping("/rooms/{roomId}/shopping/delete")
    public void deleteShoppingItem(
            @DestinationVariable Long roomId,
            ShoppingItemDeleteRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            log.error("WebSocket message without authentication");
            return;
        }

        Long userId = Long.parseLong(principal.getName());
        log.info("WebSocket shopping item delete request - roomId: {}, itemId: {}, userId: {}",
                roomId, request.getShoppingItemId(), userId);

        shoppingService.deleteShoppingItem(roomId, request.getShoppingItemId());
    }
}
