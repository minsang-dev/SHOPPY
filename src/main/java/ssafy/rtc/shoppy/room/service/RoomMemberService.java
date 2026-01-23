package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.domain.RoomMember;
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

    @Transactional
    public RoomMember joinRoomAsGuest(String roomCode) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();
        room.validateJoinable();

        RoomMember member = RoomMember.joinAsGuest(roomEntity.getRoomId());

        RoomMemberEntity memberEntity = RoomMemberEntity.fromDomain(member, roomEntity);
        RoomMemberEntity savedEntity = roomMemberRepository.save(memberEntity);

        return savedEntity.toDomain();
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
    public void leaveRoom(Long memberId) {
        RoomMemberEntity memberEntity = roomMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();
        RoomMember leftMember = member.leave();

        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(leftMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);
    }
}
