package ssafy.rtc.shoppy.chat.dto;

import ssafy.rtc.shoppy.chat.domain.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageEditedEventDto(
        String type,
        Long chatId,
        Long roomId,
        String content,
        Boolean isEdited,
        LocalDateTime editedAt
) {
    public static ChatMessageEditedEventDto from(ChatMessage message) {
        return new ChatMessageEditedEventDto(
                "MESSAGE_EDITED",
                message.getChatId(),
                message.getRoomId(),
                message.getContent(),
                message.getIsEdited(),
                message.getEditedAt()
        );
    }
}
