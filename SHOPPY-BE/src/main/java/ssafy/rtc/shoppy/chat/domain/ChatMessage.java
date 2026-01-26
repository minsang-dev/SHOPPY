package ssafy.rtc.shoppy.chat.domain;

import lombok.Getter;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.time.LocalDateTime;

@Getter
public class ChatMessage {

    private final Long chatId;
    private final Long roomId;
    private final Long senderMemberId;
    private final String content;
    private final Boolean isDeleted;
    private final Boolean isEdited;
    private final LocalDateTime createdAt;
    private final LocalDateTime editedAt;

    public static ChatMessage create(Long roomId, Long senderMemberId, String content) {
        validateContent(content);
        if (roomId == null || senderMemberId == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new ChatMessage(
                null,
                roomId,
                senderMemberId,
                content,
                false,
                false,
                LocalDateTime.now(),
                null
        );
    }

    public static ChatMessage from(
            Long chatId,
            Long roomId,
            Long senderMemberId,
            String content,
            Boolean isDeleted,
            Boolean isEdited,
            LocalDateTime createdAt,
            LocalDateTime editedAt
    ) {
        return new ChatMessage(
                chatId,
                roomId,
                senderMemberId,
                content,
                isDeleted,
                isEdited,
                createdAt,
                editedAt
        );
    }

    private ChatMessage(
            Long chatId,
            Long roomId,
            Long senderMemberId,
            String content,
            Boolean isDeleted,
            Boolean isEdited,
            LocalDateTime createdAt,
            LocalDateTime editedAt
    ) {
        this.chatId = chatId;
        this.roomId = roomId;
        this.senderMemberId = senderMemberId;
        this.content = content;
        this.isDeleted = isDeleted;
        this.isEdited = isEdited;
        this.createdAt = createdAt;
        this.editedAt = editedAt;
    }

    private static void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        if (content.length() > 500) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
    }

    public ChatMessage delete() {
        if (this.isDeleted) {
            throw new BusinessException(ErrorCode.ALREADY_DELETED);
        }
        return new ChatMessage(
                this.chatId,
                this.roomId,
                this.senderMemberId,
                this.content,
                true,
                this.isEdited,
                this.createdAt,
                this.editedAt
        );
    }

    public boolean canBeDeletedBy(Long memberId, boolean isHost) {
        if (this.isDeleted) {
            return false;
        }
        return this.senderMemberId.equals(memberId) || isHost;
    }

    public ChatMessage edit(String newContent, Long requestMemberId) {
        if (!canBeEditedBy(requestMemberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        validateContent(newContent);
        return new ChatMessage(
                this.chatId,
                this.roomId,
                this.senderMemberId,
                newContent,
                this.isDeleted,
                true,
                this.createdAt,
                LocalDateTime.now()
        );
    }

    public boolean canBeEditedBy(Long memberId) {
        if (this.isDeleted) {
            return false;
        }
        return this.senderMemberId.equals(memberId);
    }
}
