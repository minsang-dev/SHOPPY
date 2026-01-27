package ssafy.rtc.shoppy.chat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;
import ssafy.rtc.shoppy.chat.entity.ChatMessageEntity;
import ssafy.rtc.shoppy.chat.event.ChatEventPublisher;
import ssafy.rtc.shoppy.chat.repository.ChatMessageRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final ChatEventPublisher eventPublisher;

    @Transactional
    public ChatMessage sendMessage(Long roomId, Long userId, String content) {
        RoomEntity room = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        RoomMemberEntity senderMemberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        RoomMember senderMember = senderMemberEntity.toDomain();
        senderMember.validateCanSendMessage(roomId);

        Long memberId = senderMemberEntity.getMemberId();
        ChatMessage message = ChatMessage.create(roomId, memberId, content);
        ChatMessageEntity entity = ChatMessageEntity.fromDomain(message, room, senderMemberEntity);
        ChatMessageEntity savedEntity = chatMessageRepository.save(entity);

        ChatMessage savedMessage = savedEntity.toDomain();
        eventPublisher.publishMessageSent(roomId, savedMessage);

        return savedMessage;
    }

    public Page<ChatMessage> getChatHistory(Long roomId, Long userId, Pageable pageable) {
        if (userId == null) {
            Page<ChatMessageEntity> messagePage = chatMessageRepository
                    .findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);
            return messagePage.map(ChatMessageEntity::toDomain);
        }

        RoomMemberEntity roomMemberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        RoomMember roomMember = roomMemberEntity.toDomain();
        roomMember.validateCanAccessRoom(roomId);

        Page<ChatMessageEntity> messagePage = chatMessageRepository
                .findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);

        return messagePage.map(ChatMessageEntity::toDomain);
    }

    @Transactional
    public void deleteMessage(Long roomId, Long chatId, Long requestUserId) {
        ChatMessageEntity messageEntity = chatMessageRepository
                .findByChatIdAndRoomRoomId(chatId, roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        RoomEntity room = messageEntity.getRoom();

        // userId로 RoomMember 조회
        RoomMemberEntity requestMemberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, requestUserId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        Long requestMemberId = requestMemberEntity.getMemberId();
        boolean isHost = room.getHostId().equals(requestUserId);

        ChatMessage message = messageEntity.toDomain();
        if (!message.canBeDeletedBy(requestMemberId, isHost)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        ChatMessage deletedMessage = message.delete();
        messageEntity.updateIsDeleted(deletedMessage.getIsDeleted());

        eventPublisher.publishMessageDeleted(roomId, chatId);
    }

    @Transactional
    public ChatMessage editMessage(Long roomId, Long chatId, Long userId, String newContent) {
        ChatMessageEntity messageEntity = chatMessageRepository
                .findByChatIdAndRoomRoomId(chatId, roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // userId로 RoomMember 조회
        RoomMemberEntity requestMemberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        Long memberId = requestMemberEntity.getMemberId();

        ChatMessage message = messageEntity.toDomain();
        ChatMessage editedMessage = message.edit(newContent, memberId);

        messageEntity.updateContent(
                editedMessage.getContent(),
                editedMessage.getIsEdited(),
                editedMessage.getEditedAt()
        );

        ChatMessage updatedMessage = messageEntity.toDomain();
        eventPublisher.publishMessageEdited(roomId, updatedMessage);

        return updatedMessage;
    }
}
