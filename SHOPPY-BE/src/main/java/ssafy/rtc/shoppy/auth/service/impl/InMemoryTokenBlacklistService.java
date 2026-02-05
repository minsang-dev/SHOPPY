package ssafy.rtc.shoppy.auth.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ssafy.rtc.shoppy.auth.service.TokenBlacklistService;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class InMemoryTokenBlacklistService implements TokenBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    @Override
    public void blacklist(String token, long remainingMillis) {
        if (remainingMillis <= 0) {
            return;
        }
        Instant expiresAt = Instant.now().plusMillis(remainingMillis);
        blacklist.put(token, expiresAt);
        log.info("Token blacklisted, expires at: {}", expiresAt);
    }

    @Override
    public boolean isBlacklisted(String token) {
        Instant expiresAt = blacklist.get(token);
        if (expiresAt == null) {
            return false;
        }
        if (Instant.now().isAfter(expiresAt)) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    @Scheduled(fixedRate = 60_000)
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        int before = blacklist.size();
        blacklist.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
        int removed = before - blacklist.size();
        if (removed > 0) {
            log.debug("Blacklist cleanup: removed {} expired tokens, {} remaining", removed, blacklist.size());
        }
    }
}
