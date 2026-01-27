package ssafy.rtc.shoppy.chat.dto;

import ssafy.rtc.shoppy.chat.domain.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long chatId,
        Long roomId,
        Long senderMemberId,
        String content,
        Boolean isDeleted,
        Boolean isEdited,
        LocalDateTime createdAt,
        LocalDateTime editedAt
) {
    public static ChatMessageDto from(ChatMessage message) {
        return new ChatMessageDto(
                message.getChatId(),
                message.getRoomId(),
                message.getSenderMemberId(),
                message.getContent(),
                message.getIsDeleted(),
                message.getIsEdited(),
                message.getCreatedAt(),
                message.getEditedAt()
        );
    }
}
