package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.enums.RoomStatus;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

public record RoomResponseDto(
        Long roomId,

        Long hostId,

        String roomName,

        String inviteCode,

        RoomStatus roomStatus,

        BigDecimal targetBudget,

        SyncMode syncMode,

        String hostCurrentUrl
) {
    public static RoomResponseDto from(Room room) {
        return new RoomResponseDto(
                room.getRoomId(),
                room.getHostId(),
                room.getTitle(),
                room.getRoomCode(),
                room.getStatus(),
                room.getTargetBudget(),
                room.getSyncMode(),
                room.getHostCurrentUrl()
        );
    }
}
