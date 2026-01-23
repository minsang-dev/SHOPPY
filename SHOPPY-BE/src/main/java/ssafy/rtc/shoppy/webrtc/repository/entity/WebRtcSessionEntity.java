package ssafy.rtc.shoppy.webrtc.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.webrtc.domain.WebRtcSession;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WebRtcSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "max_participants", nullable = false)
    private int maxParticipants;

    public static WebRtcSessionEntity from(WebRtcSession session) {
        WebRtcSessionEntity entity = new WebRtcSessionEntity();
        entity.id = session.getId();
        entity.roomId = session.getRoomId();
        entity.maxParticipants = session.getMaxParticipants();
        return entity;
    }

    public WebRtcSession toDomain() {
        return WebRtcSession.of(id, roomId, maxParticipants);
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }
}
