package ssafy.rtc.shoppy.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.enums.RoomStatus;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "Room")
public class RoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "host_id", nullable = false)
    private Long hostId;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "room_code", unique = true, length = 50)
    private String roomCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 10)
    private RoomStatus status;

    @Column(name = "target_budget", precision = 12, scale = 2)
    private BigDecimal targetBudget;

    @Column(name = "host_current_url", length = 2048)
    private String hostCurrentUrl;

    public RoomEntity(
            Long roomId,
            Long hostId,
            String title,
            String roomCode,
            RoomStatus status,
            BigDecimal targetBudget,
            String hostCurrentUrl
    ) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.title = title;
        this.roomCode = roomCode;
        this.status = status;
        this.targetBudget = targetBudget;
        this.hostCurrentUrl = hostCurrentUrl;
    }

    @PrePersist
    public void prePersist() {
        if (this.roomCode == null) {
            this.roomCode = generateRoomCode();
        }
        if (this.status == null) {
            this.status = RoomStatus.ACTIVE;
        }
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Room toDomain() {
        return Room.from(
                this.roomId,
                this.hostId,
                this.title,
                this.roomCode,
                this.status,
                this.targetBudget,
                this.hostCurrentUrl
        );
    }

    public static RoomEntity fromDomain(Room room) {
        return new RoomEntity(
                room.getRoomId(),
                room.getHostId(),
                room.getTitle(),
                room.getRoomCode(),
                room.getStatus(),
                room.getTargetBudget(),
                room.getHostCurrentUrl()
        );
    }
}
