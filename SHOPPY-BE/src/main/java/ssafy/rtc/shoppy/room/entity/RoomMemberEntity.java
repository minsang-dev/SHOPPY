package ssafy.rtc.shoppy.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.enums.MemberRole;
import ssafy.rtc.shoppy.room.enums.MemberStatus;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "RoomMember")
public class RoomMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomEntity room;

    @Column(name = "user_id", nullable = true)
    private Long userId;

    @Column(name = "nickname", length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 10)
    private MemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 10)
    private MemberStatus status;

    @Column(name = "is_camera_on")
    private Boolean isCameraOn;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    public RoomMemberEntity(
            Long memberId,
            RoomEntity room,
            Long userId,
            String nickname,
            MemberRole role,
            MemberStatus status,
            Boolean isCameraOn,
            LocalDateTime joinedAt
    ) {
        this.memberId = memberId;
        this.room = room;
        this.userId = userId;
        this.nickname = nickname;
        this.role = role;
        this.status = status;
        this.isCameraOn = isCameraOn;
        this.joinedAt = joinedAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = MemberStatus.ACTIVE;
        }
        if (this.isCameraOn == null) {
            this.isCameraOn = false;
        }
    }

    public RoomMember toDomain() {
        return RoomMember.from(
                this.memberId,
                this.room != null ? this.room.getRoomId() : null,
                this.userId,
                this.nickname,
                this.role,
                this.status,
                this.isCameraOn,
                this.joinedAt
        );
    }

    public static RoomMemberEntity fromDomain(RoomMember member, RoomEntity room) {
        return new RoomMemberEntity(
                member.getMemberId(),
                room,
                member.getUserId(),
                member.getNickname(),
                member.getRole(),
                member.getStatus(),
                member.isCameraOn(),
                member.getJoinedAt()
        );
    }
}
