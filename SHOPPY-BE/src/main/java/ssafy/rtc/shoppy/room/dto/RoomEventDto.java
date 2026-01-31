package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.enums.RoomEventType;

public record RoomEventDto(
        RoomEventType type,
        Long roomId,
        Object payload
) {
    public static RoomEventDto hostUrlUpdated(Long roomId, String url) {
        return new RoomEventDto(RoomEventType.HOST_URL_UPDATED, roomId, url);
    }

    public static RoomEventDto closed(Long roomId) {
        return new RoomEventDto(RoomEventType.CLOSED, roomId, null);
    }
}
