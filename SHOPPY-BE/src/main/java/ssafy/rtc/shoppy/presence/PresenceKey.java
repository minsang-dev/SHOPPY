package ssafy.rtc.shoppy.presence;

public record PresenceKey(Long userId, String clientId) {
    @Override
    public String toString() {
        return userId + ":" + clientId;
    }
}
