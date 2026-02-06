package ssafy.rtc.shoppy.websocket.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.config.WebSocketMessageBrokerStats;

import javax.annotation.PostConstruct;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class WebSocketMetricsConfig {

    private final WebSocketMessageBrokerStats stats;
    private final MeterRegistry meterRegistry;

    @PostConstruct
    public void init() {
        // 초기 메트릭 등록 (Gauge)
        meterRegistry.gauge("websocket.sessions", Tags.empty(), stats, s -> (double) s.getWebSocketSessions());
        meterRegistry.gauge("websocket.stomp.sessions", Tags.empty(), stats, s -> (double) s.getStompSubSessions());
    }

    @Scheduled(fixedRate = 10000) // 10초마다 갱신 (선택사항, Gauge는 조회 시점에 계산되므로 필수는 아님)
    public void exportMetrics() {
        // 추가적인 Counter 성격의 데이터가 필요하다면 여기서 기록할 수 있습니다.
        // WebSocketMessageBrokerStats에서 제공하는 기본 정보들은 위 Gauge 등록으로 충분합니다.

        meterRegistry.counter("websocket.messages.received", Tags.empty()).increment(stats.getInboundMessageCount());
        meterRegistry.counter("websocket.messages.sent", Tags.empty()).increment(stats.getOutboundMessageCount());
    }
}
