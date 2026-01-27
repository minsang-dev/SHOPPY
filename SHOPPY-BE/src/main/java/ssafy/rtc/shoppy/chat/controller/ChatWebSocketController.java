package ssafy.rtc.shoppy.chat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;
import ssafy.rtc.shoppy.chat.dto.ChatMessageWebSocketRequestDto;
import ssafy.rtc.shoppy.chat.service.ChatService;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/rooms/{roomId}/chat")
    public void handleChatMessage(
            @DestinationVariable Long roomId,
            ChatMessageWebSocketRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            log.error("WebSocket message without authentication");
            return;
        }

        Long userId = Long.parseLong(principal.getName());

        ChatMessage savedMessage = chatService.sendMessage(roomId, userId, request.content());

        log.info("WebSocket message sent to room: {}, messageId: {}, userId: {}",
                roomId, savedMessage.getChatId(), userId);
    }
}
