package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.domain.RoomMember;

public record GuestJoinResult(
        RoomMember member,
        String accessToken
) {
}
