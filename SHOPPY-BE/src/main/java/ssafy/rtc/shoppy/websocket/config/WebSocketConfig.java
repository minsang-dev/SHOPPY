package ssafy.rtc.shoppy.websocket.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import ssafy.rtc.shoppy.ai.config.CorsProperties;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final CorsProperties corsProperties;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] allowedOrigins = corsProperties.getAllowedOrigins().toArray(new String[0]);

        // context-path가 /api이므로 엔드포인트는 /ws만 등록 (실제 경로: /api/ws)
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple in-memory broker for /topic and /queue destinations
        registry.enableSimpleBroker("/topic", "/queue");

        // Application destination prefix for @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");
    }
}
