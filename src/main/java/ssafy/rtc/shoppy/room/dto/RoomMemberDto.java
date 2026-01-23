package ssafy.rtc.shoppy.room.dto;

import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.enums.MemberRole;
import ssafy.rtc.shoppy.room.enums.MemberStatus;

import java.time.LocalDateTime;

public record RoomMemberDto(
        Long memberId,

        Long roomId,

        Long userId,

        String nickname,

        MemberRole role,

        MemberStatus status,

        Boolean isCameraOn,

        LocalDateTime joinedAt
) {
    public static RoomMemberDto from(RoomMember member) {
        return new RoomMemberDto(
                member.getMemberId(),
                member.getRoomId(),
                member.getUserId(),
                member.getNickname(),
                member.getRole(),
                member.getStatus(),
                member.isCameraOn(),
                member.getJoinedAt()
        );
    }
}
