package ssafy.rtc.shoppy.chat.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;
import ssafy.rtc.shoppy.chat.dto.ChatMessageDeletedEventDto;
import ssafy.rtc.shoppy.chat.dto.ChatMessageDto;
import ssafy.rtc.shoppy.chat.dto.ChatMessageEditedEventDto;

@Component
@RequiredArgsConstructor
public class ChatEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishMessageSent(Long roomId, ChatMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/chat",
                ChatMessageDto.from(message)
        );
    }

    public void publishMessageEdited(Long roomId, ChatMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/chat/edited",
                ChatMessageEditedEventDto.from(message)
        );
    }

    public void publishMessageDeleted(Long roomId, Long chatId) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/chat/deleted",
                ChatMessageDeletedEventDto.of(chatId, roomId)
        );
    }
}
