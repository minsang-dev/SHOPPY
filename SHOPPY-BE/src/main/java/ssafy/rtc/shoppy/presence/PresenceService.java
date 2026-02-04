package ssafy.rtc.shoppy.presence;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ssafy.rtc.shoppy.room.service.RoomMemberService;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final RoomMemberService roomMemberService;
    private final Duration ttl;
    private final ConcurrentHashMap<PresenceKey, PresenceRecord> presence = new ConcurrentHashMap<>();

    public PresenceService(
            RoomMemberService roomMemberService,
            @Value("${presence.ttl-seconds:60}") long ttlSeconds
    ) {
        this.roomMemberService = roomMemberService;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    public void heartbeat(Long roomId, Long userId, String clientId) {
        if (roomId == null || userId == null) {
            return;
        }
        String normalizedClientId = normalizeClientId(clientId);
        if (normalizedClientId == null) {
            return;
        }

        Instant now = Instant.now();
        PresenceKey key = new PresenceKey(userId, normalizedClientId);
        presence.compute(key, (k, existing) -> {
            if (existing == null) {
                return new PresenceRecord(
                        userId,
                        normalizedClientId,
                        roomId,
                        now,
                        null,
                        PresenceStatus.ACTIVE
                );
            }
            return existing.markActive(now, roomId);
        });
    }

    public void onConnect(Long userId, String clientId) {
        if (userId == null) {
            return;
        }
        String normalizedClientId = normalizeClientId(clientId);
        if (normalizedClientId == null) {
            return;
        }

        Instant now = Instant.now();
        PresenceKey key = new PresenceKey(userId, normalizedClientId);
        presence.compute(key, (k, existing) -> {
            if (existing == null) {
                return new PresenceRecord(
                        userId,
                        normalizedClientId,
                        null,
                        now,
                        null,
                        PresenceStatus.ACTIVE
                );
            }
            return existing.markActive(now, null);
        });
    }

    public void onDisconnect(Long userId, String clientId) {
        if (userId == null) {
            return;
        }
        String normalizedClientId = normalizeClientId(clientId);
        if (normalizedClientId == null) {
            return;
        }

        Instant now = Instant.now();
        PresenceKey key = new PresenceKey(userId, normalizedClientId);
        presence.compute(key, (k, existing) -> {
            if (existing == null) {
                return new PresenceRecord(
                        userId,
                        normalizedClientId,
                        null,
                        now,
                        now.plus(ttl),
                        PresenceStatus.DISCONNECTED
                );
            }
            return existing.markDisconnected(now, ttl);
        });
    }

    public void sweepExpired() {
        Instant now = Instant.now();
        List<PresenceRecord> expired = new ArrayList<>();
        for (PresenceRecord record : presence.values()) {
            if (record.isExpired(now)) {
                expired.add(record);
            }
        }
        if (expired.isEmpty()) {
            return;
        }

        Map<RoomUserKey, List<PresenceRecord>> expiredByRoomUser = new HashMap<>();
        for (PresenceRecord record : expired) {
            if (record.roomId() == null) {
                presence.remove(record.key(), record);
                continue;
            }
            RoomUserKey roomUserKey = new RoomUserKey(record.roomId(), record.userId());
            expiredByRoomUser.computeIfAbsent(roomUserKey, key -> new ArrayList<>()).add(record);
        }

        for (Map.Entry<RoomUserKey, List<PresenceRecord>> entry : expiredByRoomUser.entrySet()) {
            RoomUserKey roomUserKey = entry.getKey();
            if (hasActiveSession(roomUserKey)) {
                for (PresenceRecord record : entry.getValue()) {
                    presence.remove(record.key(), record);
                }
                continue;
            }

            roomMemberService.leaveRoomByUserIdIfActive(roomUserKey.roomId(), roomUserKey.userId());
            presence.entrySet().removeIf(item -> roomUserKey.matches(item.getValue()));
        }
    }

    private boolean hasActiveSession(RoomUserKey roomUserKey) {
        for (PresenceRecord record : presence.values()) {
            if (roomUserKey.matches(record) && record.isActive()) {
                return true;
            }
        }
        return false;
    }

    private String normalizeClientId(String clientId) {
        if (clientId == null) {
            return null;
        }
        String trimmed = clientId.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private record RoomUserKey(Long roomId, Long userId) {
        boolean matches(PresenceRecord record) {
            return Objects.equals(roomId, record.roomId())
                    && Objects.equals(userId, record.userId());
        }
    }
}
