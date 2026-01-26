package ssafy.rtc.shoppy.chat.dto;

import org.springframework.data.domain.Page;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;

import java.util.List;

public record ChatMessageListResponseDto(
        List<ChatMessageDto> messages,
        long totalElements,
        int totalPages,
        int currentPage,
        boolean hasNext
) {
    public static ChatMessageListResponseDto from(Page<ChatMessage> messagePage) {
        List<ChatMessageDto> messages = messagePage.getContent().stream()
                .map(ChatMessageDto::from)
                .toList();

        return new ChatMessageListResponseDto(
                messages,
                messagePage.getTotalElements(),
                messagePage.getTotalPages(),
                messagePage.getNumber(),
                messagePage.hasNext()
        );
    }
}
