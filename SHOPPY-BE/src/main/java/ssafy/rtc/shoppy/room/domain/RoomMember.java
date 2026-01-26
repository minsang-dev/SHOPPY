package ssafy.rtc.shoppy.room.domain;

import lombok.Getter;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.enums.MemberRole;
import ssafy.rtc.shoppy.room.enums.MemberStatus;

import java.time.LocalDateTime;

@Getter
public class RoomMember {

    private final Long memberId;
    private final Long roomId;
    private final Long userId;
    private final String nickname;
    private final MemberRole role;
    private final MemberStatus status;
    private final boolean isCameraOn;
    private final LocalDateTime joinedAt;

    public static RoomMember join(Long roomId, Long userId, String nickname, MemberRole role) {
        if (roomId == null || userId == null || role == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new RoomMember(
                null,
                roomId,
                userId,
                nickname,
                role,
                MemberStatus.ACTIVE,
                false,
                LocalDateTime.now()
        );
    }

    public static RoomMember joinAsGuest(Long roomId, String nickname) {
        if (roomId == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new RoomMember(
                null,
                roomId,
                null,
                nickname,
                MemberRole.GUEST,
                MemberStatus.ACTIVE,
                false,
                LocalDateTime.now()
        );
    }

    public static RoomMember from(
            Long memberId,
            Long roomId,
            Long userId,
            String nickname,
            MemberRole role,
            MemberStatus status,
            Boolean isCameraOn,
            LocalDateTime joinedAt
    ) {
        return new RoomMember(
                memberId,
                roomId,
                userId,
                nickname,
                role,
                status,
                isCameraOn != null ? isCameraOn : false,
                joinedAt
        );
    }

    private RoomMember(
            Long memberId,
            Long roomId,
            Long userId,
            String nickname,
            MemberRole role,
            MemberStatus status,
            boolean isCameraOn,
            LocalDateTime joinedAt
    ) {
        this.memberId = memberId;
        this.roomId = roomId;
        this.userId = userId;
        this.nickname = nickname;
        this.role = role;
        this.status = status;
        this.isCameraOn = isCameraOn;
        this.joinedAt = joinedAt;
    }

    public RoomMember updateStatus(MemberStatus newStatus) {
        if (newStatus == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new RoomMember(
                this.memberId,
                this.roomId,
                this.userId,
                this.nickname,
                this.role,
                newStatus,
                this.isCameraOn,
                this.joinedAt
        );
    }

    public RoomMember toggleCamera() {
        return new RoomMember(
                this.memberId,
                this.roomId,
                this.userId,
                this.nickname,
                this.role,
                this.status,
                !this.isCameraOn,
                this.joinedAt
        );
    }

    public RoomMember updateCameraState(Boolean newCameraOn) {
        boolean resolvedCameraOn = newCameraOn != null ? newCameraOn : this.isCameraOn;

        return new RoomMember(
                this.memberId,
                this.roomId,
                this.userId,
                this.nickname,
                this.role,
                this.status,
                resolvedCameraOn,
                this.joinedAt
        );
    }

    public RoomMember leave() {
        return updateStatus(MemberStatus.LEFT);
    }

    public boolean isActive() {
        return this.status == MemberStatus.ACTIVE;
    }

    public boolean isHost() {
        return this.role == MemberRole.HOST;
    }

    public boolean isInRoom(Long requestedRoomId) {
        return this.roomId.equals(requestedRoomId);
    }

    public void validateCanSendMessage(Long requestedRoomId) {
        if (!isInRoom(requestedRoomId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (!isActive()) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    public void validateCanAccessRoom(Long requestedRoomId) {
        if (!isInRoom(requestedRoomId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
