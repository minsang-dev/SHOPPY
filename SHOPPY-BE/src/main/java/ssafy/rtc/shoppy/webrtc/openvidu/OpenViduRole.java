package ssafy.rtc.shoppy.webrtc.openvidu;

public enum OpenViduRole {
    PUBLISHER,
    SUBSCRIBER,
    MODERATOR;

    public static OpenViduRole from(String value) {
        if (value == null || value.isBlank()) {
            return PUBLISHER;
        }
        try {
            return OpenViduRole.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return PUBLISHER;
        }
    }
}
