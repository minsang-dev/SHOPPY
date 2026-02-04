package ssafy.rtc.shoppy.scroll.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ssafy.rtc.shoppy.scroll.dto.ScrollPositionDto;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ScrollWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/rooms/{roomId}/scroll")
    public void updateScrollPosition(
            @DestinationVariable Long roomId,
            @Valid ScrollPositionDto scrollPosition,
            Principal principal
    ) {
        if (principal == null) {
            log.error("WebSocket scroll message without authentication");
            return;
        }

        Long authenticatedUserId = Long.parseLong(principal.getName());

        if (!authenticatedUserId.equals(scrollPosition.userId())) {
            log.warn("User {} attempted to spoof scroll for user {}",
                    authenticatedUserId, scrollPosition.userId());
            return;
        }

        String destination = "/topic/rooms/" + roomId + "/scroll";
        messagingTemplate.convertAndSend(destination, scrollPosition);

        log.debug("Scroll broadcast: roomId={}, userId={}, x={}, y={}",
                roomId, scrollPosition.userId(),
                scrollPosition.scrollX(), scrollPosition.scrollY());
    }
}
