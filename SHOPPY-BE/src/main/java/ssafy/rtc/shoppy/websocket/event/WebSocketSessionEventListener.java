package ssafy.rtc.shoppy.websocket.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ssafy.rtc.shoppy.presence.PresenceKey;
import ssafy.rtc.shoppy.presence.PresenceService;

import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSessionEventListener {

    private final PresenceService presenceService;
    private final ConcurrentHashMap<String, PresenceKey> sessionToPresence = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Long userId = extractUserId(accessor.getUser());
        String clientId = accessor.getFirstNativeHeader("X-Client-Id");

        if (sessionId == null || userId == null) {
            return;
        }
        if (clientId == null || clientId.isBlank()) {
            log.warn("WebSocket connected without clientId. userId={}, sessionId={}", userId, sessionId);
            return;
        }

        String normalizedClientId = clientId.trim();
        sessionToPresence.put(sessionId, new PresenceKey(userId, normalizedClientId));
        presenceService.onConnect(userId, normalizedClientId);
        log.debug("WebSocket connected: userId={}, clientId={}, sessionId={}",
                userId, normalizedClientId, sessionId);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Long userId = extractUserId(accessor.getUser());
        PresenceKey presenceKey = sessionId != null ? sessionToPresence.remove(sessionId) : null;
        String clientId = presenceKey != null ? presenceKey.clientId() : null;
        Long resolvedUserId = presenceKey != null ? presenceKey.userId() : userId;

        if (resolvedUserId == null || clientId == null) {
            log.debug("WebSocket disconnected without presence info. sessionId={}", sessionId);
            return;
        }

        presenceService.onDisconnect(resolvedUserId, clientId);
        log.debug("WebSocket disconnected: userId={}, clientId={}, sessionId={}",
                resolvedUserId, clientId, sessionId);
    }

    private Long extractUserId(Principal principal) {
        if (principal == null) {
            return null;
        }
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException ex) {
            log.warn("WebSocket principal is not a user id: {}", principal.getName());
            return null;
        }
    }
}
