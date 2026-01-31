package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.auth.entity.Member;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.dto.RoomEventDto;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberRole;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Room createRoom(String roomName, BigDecimal targetBudget, Long hostId) {
        // 1. Room 생성
        Room room = Room.create(hostId, roomName, targetBudget);

        RoomEntity roomEntity = RoomEntity.fromDomain(room);
        RoomEntity savedEntity = roomRepository.save(roomEntity);

        // 2. 호스트의 Member 정보 조회
        Member hostMember = memberRepository.findById(hostId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 3. 호스트의 RoomMember 자동 생성
        RoomMember hostRoomMember = RoomMember.join(
                savedEntity.getRoomId(),
                hostId,
                hostMember.getNickname(),
                MemberRole.HOST
        );

        RoomMemberEntity hostRoomMemberEntity = RoomMemberEntity.fromDomain(
                hostRoomMember,
                savedEntity
        );
        roomMemberRepository.save(hostRoomMemberEntity);

        return savedEntity.toDomain();
    }

    public Room getRoomById(Long roomId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return roomEntity.toDomain();
    }

    public Room getRoomByCode(String roomCode) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return roomEntity.toDomain();
    }

    @Transactional
    public void updateHostCurrentUrl(Long roomId, Long requestUserId, String currentUrl) {
        if (currentUrl == null || currentUrl.isBlank()) {
            throw new BusinessException(ErrorCode.HOST_URL_REQUIRED);
        }

        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();

        if (!room.isHost(requestUserId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        Room updatedRoom = room.updateHostCurrentUrl(currentUrl);
        RoomEntity updatedEntity = RoomEntity.fromDomain(updatedRoom);
        roomRepository.save(updatedEntity);

        // WebSocket event: host URL updated
        publishRoomEvent(roomId, "/host-url", RoomEventDto.hostUrlUpdated(roomId, currentUrl));
    }

    @Transactional
    public void closeRoom(Long roomId, Long requestUserId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();

        if (!room.isHost(requestUserId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        Room closedRoom = room.close();
        RoomEntity updatedEntity = RoomEntity.fromDomain(closedRoom);
        roomRepository.save(updatedEntity);

        // WebSocket event: room closed
        publishRoomEvent(roomId, "/status", RoomEventDto.closed(roomId));
    }

    /**
     * Publish room event to WebSocket subscribers
     */
    private void publishRoomEvent(Long roomId, String destination, RoomEventDto event) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + destination, event);
    }
}
