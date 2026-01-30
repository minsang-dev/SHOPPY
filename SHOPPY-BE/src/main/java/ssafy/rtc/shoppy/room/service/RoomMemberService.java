package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.auth.entity.Member;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.dto.GuestJoinResult;
import ssafy.rtc.shoppy.room.dto.RoomMemberEventDto;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberRole;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.enums.SyncMode;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomMemberService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomService roomService;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public RoomMember joinRoomAsUser(String roomCode, Long userId) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();
        room.validateJoinable();

        // 이미 입장했는지 확인 (ACTIVE 상태)
        Optional<RoomMemberEntity> existingMember = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomEntity.getRoomId(), userId, MemberStatus.ACTIVE);

        if (existingMember.isPresent()) {
            // 이미 입장한 경우 기존 RoomMember 반환
            return existingMember.get().toDomain();
        }

        // 로그인 사용자 정보 조회
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // RoomMember 생성
        RoomMember roomMember = RoomMember.join(
                roomEntity.getRoomId(),
                userId,
                member.getNickname(),
                MemberRole.GUEST
        );

        RoomMemberEntity memberEntity = RoomMemberEntity.fromDomain(roomMember, roomEntity);
        RoomMemberEntity savedEntity = roomMemberRepository.save(memberEntity);

        RoomMember savedMember = savedEntity.toDomain();

        // WebSocket event: member joined
        publishMemberEvent(savedMember.getRoomId(), RoomMemberEventDto.joined(savedMember));

        return savedMember;
    }

    @Transactional
    public GuestJoinResult joinRoomAsGuest(String roomCode, String nickname) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();
        room.validateJoinable();

        // 1. 게스트용 임시 Member 생성
        Member guestMember = Member.builder()
                .oauthId(UUID.randomUUID().toString())
                .provider("GUEST")
                .nickname(nickname)
                .build();
        Member savedGuestMember = memberRepository.save(guestMember);

        // 2. RoomMember 생성 (userId 포함)
        RoomMember member = RoomMember.join(
                roomEntity.getRoomId(),
                savedGuestMember.getUserId(),
                nickname,
                MemberRole.GUEST
        );

        RoomMemberEntity memberEntity = RoomMemberEntity.fromDomain(member, roomEntity);
        RoomMemberEntity savedEntity = roomMemberRepository.save(memberEntity);

        RoomMember savedMember = savedEntity.toDomain();

        // WebSocket event: member joined
        publishMemberEvent(savedMember.getRoomId(), RoomMemberEventDto.joined(savedMember));

        // 3. JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(savedGuestMember.getUserId());

        return new GuestJoinResult(savedMember, accessToken);
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
    public void leaveRoomByUserId(Long roomId, Long userId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        boolean isHost = roomEntity.getHostId().equals(userId);
        if (isHost) {
            // Host leaves -> close room and mark all active members as LEFT
            roomService.closeRoom(roomId, userId);

            List<RoomMemberEntity> activeMembers = roomMemberRepository
                    .findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);

            for (RoomMemberEntity memberEntity : activeMembers) {
                RoomMember member = memberEntity.toDomain();
                RoomMember leftMember = member.leave();
                RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(leftMember, memberEntity.getRoom());
                roomMemberRepository.save(updatedEntity);
                publishMemberEvent(leftMember.getRoomId(), RoomMemberEventDto.left(leftMember));
            }
            return;
        }

        RoomMemberEntity memberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();
        RoomMember leftMember = member.leave();

        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(leftMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);

        // WebSocket event: member left
        publishMemberEvent(leftMember.getRoomId(), RoomMemberEventDto.left(leftMember));
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
    public void updateMemberStateByUserId(Long roomId, Long userId, Boolean isCameraOn) {
        RoomMemberEntity memberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();
        RoomMember updatedMember = member.updateCameraState(isCameraOn);
        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(updatedMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);

        // WebSocket event: member state updated
        publishMemberEvent(updatedMember.getRoomId(), RoomMemberEventDto.stateUpdated(updatedMember));
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

    @Transactional
    public void updateMemberSyncModeByUserId(Long roomId, Long userId, SyncMode syncMode) {
        RoomMemberEntity memberEntity = roomMemberRepository
                .findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_MEMBER_NOT_FOUND));

        RoomMember member = memberEntity.toDomain();
        RoomMember updatedMember = member.updateSyncMode(syncMode);
        RoomMemberEntity updatedEntity = RoomMemberEntity.fromDomain(updatedMember, memberEntity.getRoom());
        roomMemberRepository.save(updatedEntity);

        // WebSocket event: member sync mode updated
        publishMemberEvent(updatedMember.getRoomId(), RoomMemberEventDto.syncModeUpdated(updatedMember));
    }

    /**
     * Publish member event to WebSocket subscribers
     */
    private void publishMemberEvent(Long roomId, RoomMemberEventDto event) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/members", event);
    }
}
