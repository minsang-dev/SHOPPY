package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.enums.RoomMemberEventType;

public record RoomMemberEventDto(
        RoomMemberEventType type,
        RoomMemberDto member
) {
    public static RoomMemberEventDto joined(RoomMember member) {
        return new RoomMemberEventDto(RoomMemberEventType.JOINED, RoomMemberDto.from(member));
    }

    public static RoomMemberEventDto left(RoomMember member) {
        return new RoomMemberEventDto(RoomMemberEventType.LEFT, RoomMemberDto.from(member));
    }

    public static RoomMemberEventDto stateUpdated(RoomMember member) {
        return new RoomMemberEventDto(RoomMemberEventType.STATE_UPDATED, RoomMemberDto.from(member));
    }

    public static RoomMemberEventDto syncModeUpdated(RoomMember member) {
        return new RoomMemberEventDto(RoomMemberEventType.SYNC_MODE_UPDATED, RoomMemberDto.from(member));
    }
}
