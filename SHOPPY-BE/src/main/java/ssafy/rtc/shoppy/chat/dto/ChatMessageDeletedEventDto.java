package ssafy.rtc.shoppy.chat.dto;

public record ChatMessageDeletedEventDto(
        String type,
        Long chatId,
        Long roomId
) {
    public static ChatMessageDeletedEventDto of(Long chatId, Long roomId) {
        return new ChatMessageDeletedEventDto(
                "MESSAGE_DELETED",
                chatId,
                roomId
        );
    }
}
