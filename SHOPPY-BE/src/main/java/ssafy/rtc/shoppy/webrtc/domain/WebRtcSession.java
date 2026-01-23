package ssafy.rtc.shoppy.webrtc.domain;

public class WebRtcSession {

    private static final int DEFAULT_MAX_PARTICIPANTS = 8;

    private final Long id;
    private final Long roomId;
    private final int maxParticipants;

    private WebRtcSession(Long id, Long roomId, int maxParticipants) {
        this.id = id;
        this.roomId = roomId;
        this.maxParticipants = maxParticipants;
    }

    public static WebRtcSession create(Long roomId) {
        return new WebRtcSession(null, roomId, DEFAULT_MAX_PARTICIPANTS);
    }

    public static WebRtcSession of(Long id, Long roomId, int maxParticipants) {
        return new WebRtcSession(id, roomId, maxParticipants);
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
