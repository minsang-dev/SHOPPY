package ssafy.rtc.shoppy.presence;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PresenceScheduler {

    private final PresenceService presenceService;

    @Scheduled(fixedDelayString = "${presence.sweep-interval-ms:5000}")
    public void sweepExpiredPresence() {
        presenceService.sweepExpired();
    }
}
