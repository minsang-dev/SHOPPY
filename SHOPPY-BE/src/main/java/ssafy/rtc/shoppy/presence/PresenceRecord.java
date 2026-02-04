package ssafy.rtc.shoppy.presence;

import java.time.Duration;
import java.time.Instant;

public record PresenceRecord(
        Long userId,
        String clientId,
        Long roomId,
        Instant lastSeen,
        Instant expiresAt,
        PresenceStatus status
) {
    public PresenceKey key() {
        return new PresenceKey(userId, clientId);
    }

    public PresenceRecord markActive(Instant now, Long newRoomId) {
        Long resolvedRoomId = newRoomId != null ? newRoomId : roomId;
        return new PresenceRecord(userId, clientId, resolvedRoomId, now, null, PresenceStatus.ACTIVE);
    }

    public PresenceRecord markDisconnected(Instant now, Duration ttl) {
        Instant resolvedLastSeen = lastSeen != null ? lastSeen : now;
        return new PresenceRecord(
                userId,
                clientId,
                roomId,
                resolvedLastSeen,
                now.plus(ttl),
                PresenceStatus.DISCONNECTED
        );
    }

    public boolean isExpired(Instant now) {
        return status == PresenceStatus.DISCONNECTED && expiresAt != null && !expiresAt.isAfter(now);
    }

    public boolean isActive() {
        return status == PresenceStatus.ACTIVE;
    }
}
