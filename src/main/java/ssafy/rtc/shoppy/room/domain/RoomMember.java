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
    private final MemberRole role;
    private final MemberStatus status;
    private final boolean isCameraOn;
    private final Integer currentCursorX;
    private final Integer currentCursorY;
    private final LocalDateTime joinedAt;

    public static RoomMember join(Long roomId, Long userId, MemberRole role) {
        if (roomId == null || userId == null || role == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new RoomMember(
                null,
                roomId,
                userId,
                role,
                MemberStatus.ACTIVE,
                false,
                null,
                null,
                LocalDateTime.now()
        );
    }

    public static RoomMember from(
            Long memberId,
            Long roomId,
            Long userId,
            MemberRole role,
            MemberStatus status,
            Boolean isCameraOn,
            Integer currentCursorX,
            Integer currentCursorY,
            LocalDateTime joinedAt
    ) {
        return new RoomMember(
                memberId,
                roomId,
                userId,
                role,
                status,
                isCameraOn != null ? isCameraOn : false,
                currentCursorX,
                currentCursorY,
                joinedAt
        );
    }

    private RoomMember(
            Long memberId,
            Long roomId,
            Long userId,
            MemberRole role,
            MemberStatus status,
            boolean isCameraOn,
            Integer currentCursorX,
            Integer currentCursorY,
            LocalDateTime joinedAt
    ) {
        this.memberId = memberId;
        this.roomId = roomId;
        this.userId = userId;
        this.role = role;
        this.status = status;
        this.isCameraOn = isCameraOn;
        this.currentCursorX = currentCursorX;
        this.currentCursorY = currentCursorY;
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
                this.role,
                newStatus,
                this.isCameraOn,
                this.currentCursorX,
                this.currentCursorY,
                this.joinedAt
        );
    }

    public RoomMember toggleCamera() {
        return new RoomMember(
                this.memberId,
                this.roomId,
                this.userId,
                this.role,
                this.status,
                !this.isCameraOn,
                this.currentCursorX,
                this.currentCursorY,
                this.joinedAt
        );
    }

    public RoomMember updateCursorPosition(Integer x, Integer y) {
        return new RoomMember(
                this.memberId,
                this.roomId,
                this.userId,
                this.role,
                this.status,
                this.isCameraOn,
                x,
                y,
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
}
