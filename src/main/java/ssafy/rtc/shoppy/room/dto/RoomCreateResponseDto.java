package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.enums.RoomStatus;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;

public record RoomCreateResponseDto(
        Long roomId,

        Long hostId,

        String roomName,

        String inviteCode,

        RoomStatus roomStatus,

        BigDecimal targetBudget,

        SyncMode syncMode,

        String hostCurrentUrl,

        RoomMetaDto roomMeta
) {
    public static RoomCreateResponseDto from(Room room, RoomMetaDto roomMeta) {
        return new RoomCreateResponseDto(
                room.getRoomId(),
                room.getHostId(),
                room.getTitle(),
                room.getRoomCode(),
                room.getStatus(),
                room.getTargetBudget(),
                room.getSyncMode(),
                room.getHostCurrentUrl(),
                roomMeta
        );
    }
}
