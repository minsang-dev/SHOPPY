package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.enums.RoomEventType;
import ssafy.rtc.shoppy.room.enums.SyncMode;

public record RoomEventDto(
        RoomEventType type,
        Long roomId,
        Object payload
) {
    public static RoomEventDto syncModeChanged(Long roomId, SyncMode syncMode) {
        return new RoomEventDto(RoomEventType.SYNC_MODE_CHANGED, roomId, syncMode);
    }

    public static RoomEventDto hostUrlUpdated(Long roomId, String url) {
        return new RoomEventDto(RoomEventType.HOST_URL_UPDATED, roomId, url);
    }

    public static RoomEventDto closed(Long roomId) {
        return new RoomEventDto(RoomEventType.CLOSED, roomId, null);
    }
}
