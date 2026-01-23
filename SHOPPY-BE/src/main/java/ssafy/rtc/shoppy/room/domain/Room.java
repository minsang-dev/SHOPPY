package ssafy.rtc.shoppy.room.domain;

import lombok.Getter;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.enums.RoomStatus;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

@Getter
public class Room {

    private final Long roomId;
    private final Long hostId;
    private final String title;
    private final String roomCode;
    private final RoomStatus status;
    private final BigDecimal targetBudget;
    private final SyncMode syncMode;
    private final String hostCurrentUrl;

    public static Room create(Long hostId, String title, BigDecimal targetBudget, SyncMode syncMode) {
        validateCreation(hostId, title, targetBudget, syncMode);
        return new Room(null, hostId, title, null, RoomStatus.ACTIVE, targetBudget, syncMode, null);
    }

    public static Room from(
            Long roomId,
            Long hostId,
            String title,
            String roomCode,
            RoomStatus status,
            BigDecimal targetBudget,
            SyncMode syncMode,
            String hostCurrentUrl
    ) {
        return new Room(roomId, hostId, title, roomCode, status, targetBudget, syncMode, hostCurrentUrl);
    }

    private Room(
            Long roomId,
            Long hostId,
            String title,
            String roomCode,
            RoomStatus status,
            BigDecimal targetBudget,
            SyncMode syncMode,
            String hostCurrentUrl
    ) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.title = title;
        this.roomCode = roomCode;
        this.status = status;
        this.targetBudget = targetBudget;
        this.syncMode = syncMode;
        this.hostCurrentUrl = hostCurrentUrl;
    }

    private static void validateCreation(Long hostId, String title, BigDecimal targetBudget, SyncMode syncMode) {
        if (hostId == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        if (targetBudget == null || targetBudget.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        if (syncMode == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
    }

    public Room updateStatus(RoomStatus newStatus) {
        if (newStatus == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new Room(
                this.roomId,
                this.hostId,
                this.title,
                this.roomCode,
                newStatus,
                this.targetBudget,
                this.syncMode,
                this.hostCurrentUrl
        );
    }

    public Room updateSyncMode(SyncMode newSyncMode) {
        if (newSyncMode == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }
        return new Room(
                this.roomId,
                this.hostId,
                this.title,
                this.roomCode,
                this.status,
                this.targetBudget,
                newSyncMode,
                this.hostCurrentUrl
        );
    }

    public Room updateHostCurrentUrl(String newUrl) {
        return new Room(
                this.roomId,
                this.hostId,
                this.title,
                this.roomCode,
                this.status,
                this.targetBudget,
                this.syncMode,
                newUrl
        );
    }

    public Room close() {
        return updateStatus(RoomStatus.CLOSED);
    }

    public boolean isActive() {
        return this.status == RoomStatus.ACTIVE;
    }

    public boolean isHost(Long userId) {
        return this.hostId.equals(userId);
    }

    public void validateJoinable() {
        if (!isActive()) {
            throw new BusinessException(ErrorCode.ROOM_CLOSED);
        }
    }
}
