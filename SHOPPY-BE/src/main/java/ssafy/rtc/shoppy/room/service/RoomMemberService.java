package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.dto.RoomMemberEventDto;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomMemberService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public RoomMember joinRoomAsGuest(String roomCode, String nickname) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();
        room.validateJoinable();

        RoomMember member = RoomMember.joinAsGuest(roomEntity.getRoomId(), nickname);

        RoomMemberEntity memberEntity = RoomMemberEntity.fromDomain(member, roomEntity);
        RoomMemberEntity savedEntity = roomMemberRepository.save(memberEntity);

        RoomMember savedMember = savedEntity.toDomain();

        // WebSocket event: member joined
        publishMemberEvent(savedMember.getRoomId(), RoomMemberEventDto.joined(savedMember));

        return savedMember;
    }

    public List<RoomMember> getRoomMembers(Long roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        List<RoomMemberEntity> memberEntities = roomMemberRepository
                .findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);

        return memberEntities.stream()
                .map(RoomMemberEntity::toDomain)
                .toList();
    }

    @Transactional
    public void leaveRoom(Long roomId, Long memberId) {
        RoomMemberEntity memberEntity = roomMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();

        if (!member.getRoomId().equals(roomId)) {
            throw new BusinessException(ErrorCode.INVALID_ROOM_MEMBER);
        }

        RoomMember leftMember = member.leave();

        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(leftMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);

        // WebSocket event: member left
        publishMemberEvent(leftMember.getRoomId(), RoomMemberEventDto.left(leftMember));
    }

    @Transactional
    public void updateMemberState(Long roomId, Long memberId, Boolean isCameraOn) {
        RoomMemberEntity memberEntity = roomMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();

        if (!member.getRoomId().equals(roomId)) {
            throw new BusinessException(ErrorCode.INVALID_ROOM_MEMBER);
        }

        RoomMember updatedMember = member.updateCameraState(isCameraOn);
        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(updatedMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);

        // WebSocket event: member state updated
        publishMemberEvent(updatedMember.getRoomId(), RoomMemberEventDto.stateUpdated(updatedMember));
    }

    /**
     * Publish member event to WebSocket subscribers
     */
    private void publishMemberEvent(Long roomId, RoomMemberEventDto event) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/members", event);
    }
}
