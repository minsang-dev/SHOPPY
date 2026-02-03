package ssafy.rtc.shoppy.websocket.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ssafy.rtc.shoppy.room.service.RoomMemberService;

import java.security.Principal;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSessionEventListener {

    private final RoomMemberService roomMemberService;
    private final ConcurrentHashMap<String, Long> sessionToUser = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Set<String>> userToSessions = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Long userId = extractUserId(accessor.getUser());

        if (sessionId == null || userId == null) {
            return;
        }

        sessionToUser.put(sessionId, userId);
        userToSessions.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet()).add(sessionId);
        log.debug("WebSocket connected: userId={}, sessionId={}, activeSessions={}",
                userId, sessionId, userToSessions.get(userId).size());
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Long userId = extractUserId(accessor.getUser());

        if (sessionId != null) {
            Long mappedUserId = sessionToUser.remove(sessionId);
            if (userId == null) {
                userId = mappedUserId;
            }
        }

        if (userId == null) {
            log.debug("WebSocket disconnected without user info. sessionId={}", sessionId);
            return;
        }

        boolean noActiveSessions = removeSession(userId, sessionId);
        log.debug("WebSocket disconnected: userId={}, sessionId={}, remainingSessions={}",
                userId, sessionId, userToSessions.getOrDefault(userId, Set.of()).size());

        if (noActiveSessions) {
            roomMemberService.leaveActiveRoomByUserId(userId);
        }
    }

    private boolean removeSession(Long userId, String sessionId) {
        if (sessionId == null) {
            return userToSessions.remove(userId) != null;
        }

        userToSessions.computeIfPresent(userId, (id, sessions) -> {
            sessions.remove(sessionId);
            return sessions.isEmpty() ? null : sessions;
        });

        return !userToSessions.containsKey(userId);
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
