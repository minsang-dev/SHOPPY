package ssafy.rtc.shoppy.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ssafy.rtc.shoppy.chat.entity.ChatMessageEntity;

import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    @Query("SELECT c FROM ChatMessageEntity c " +
            "JOIN FETCH c.senderMember " +
            "WHERE c.room.roomId = :roomId " +
            "AND c.isDeleted = false " +
            "ORDER BY c.createdAt DESC")
    Page<ChatMessageEntity> findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(
            @Param("roomId") Long roomId,
            Pageable pageable
    );

    @Query("SELECT c FROM ChatMessageEntity c " +
            "JOIN FETCH c.senderMember " +
            "JOIN FETCH c.room " +
            "WHERE c.chatId = :chatId " +
            "AND c.room.roomId = :roomId")
    Optional<ChatMessageEntity> findByChatIdAndRoomRoomId(
            @Param("chatId") Long chatId,
            @Param("roomId") Long roomId
    );
}
