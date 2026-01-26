package ssafy.rtc.shoppy.chat.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ChatMessage")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Long chatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomEntity room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_member_id", nullable = false)
    private RoomMemberEntity senderMember;

    @Column(name = "content", length = 500, nullable = false)
    private String content;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    public ChatMessageEntity(
            Long chatId,
            RoomEntity room,
            RoomMemberEntity senderMember,
            String content,
            Boolean isDeleted,
            Boolean isEdited,
            LocalDateTime createdAt,
            LocalDateTime editedAt
    ) {
        this.chatId = chatId;
        this.room = room;
        this.senderMember = senderMember;
        this.content = content;
        this.isDeleted = isDeleted;
        this.isEdited = isEdited;
        this.createdAt = createdAt;
        this.editedAt = editedAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
        if (this.isEdited == null) {
            this.isEdited = false;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public ChatMessage toDomain() {
        return ChatMessage.from(
                this.chatId,
                this.room != null ? this.room.getRoomId() : null,
                this.senderMember != null ? this.senderMember.getMemberId() : null,
                this.content,
                this.isDeleted,
                this.isEdited,
                this.createdAt,
                this.editedAt
        );
    }

    public static ChatMessageEntity fromDomain(ChatMessage message, RoomEntity room, RoomMemberEntity senderMember) {
        return new ChatMessageEntity(
                message.getChatId(),
                room,
                senderMember,
                message.getContent(),
                message.getIsDeleted(),
                message.getIsEdited(),
                message.getCreatedAt(),
                message.getEditedAt()
        );
    }

    public void updateIsDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public void updateContent(String content, boolean isEdited, LocalDateTime editedAt) {
        this.content = content;
        this.isEdited = isEdited;
        this.editedAt = editedAt;
    }
}
