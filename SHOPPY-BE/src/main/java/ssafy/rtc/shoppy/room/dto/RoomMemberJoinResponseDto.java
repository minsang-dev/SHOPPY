package ssafy.rtc.shoppy.room.dto;

public record RoomMemberJoinResponseDto(
        RoomMemberDto member,
        String accessToken
) {
    public static RoomMemberJoinResponseDto from(GuestJoinResult result) {
        return new RoomMemberJoinResponseDto(
                RoomMemberDto.from(result.member()),
                result.accessToken()
        );
    }
}
