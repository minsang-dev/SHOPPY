package ssafy.rtc.shoppy.websocket.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@RequiredArgsConstructor
public class WebSocketMetricsConfig {

    private final MeterRegistry meterRegistry;
    private final AtomicInteger sessionCount = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        // 실시간 세션 수를 Gauge로 등록
        meterRegistry.gauge("websocket.sessions", Tags.empty(), sessionCount);
    }

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        sessionCount.incrementAndGet();
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        sessionCount.decrementAndGet();
    }
}
