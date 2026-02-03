package ssafy.rtc.shoppy.cursor.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ssafy.rtc.shoppy.cursor.dto.CursorPositionDto;

import java.security.Principal;

/**
 * 공유커서 WebSocket 컨트롤러
 * 실시간 커서 위치를 방 내 모든 사용자에게 브로드캐스트
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class CursorWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 커서 위치 업데이트 처리
     *
     * 클라이언트 전송: /app/rooms/{roomId}/cursor
     * 브로드캐스트: /topic/rooms/{roomId}/cursor
     */
    @MessageMapping("/rooms/{roomId}/cursor")
    public void updateCursorPosition(
            @DestinationVariable Long roomId,
            @Valid CursorPositionDto cursorPosition,
            Principal principal
    ) {
        // Principal null 체크
        if (principal == null) {
            log.error("WebSocket cursor message without authentication");
            return;
        }

        // JWT에서 userId 추출
        Long authenticatedUserId = Long.parseLong(principal.getName());

        // 보안: userId spoofing 방지
        if (!authenticatedUserId.equals(cursorPosition.userId())) {
            log.warn("User {} attempted to spoof cursor for user {}",
                    authenticatedUserId, cursorPosition.userId());
            return; // 조용히 거부 (브로드캐스트 하지 않음)
        }

        // 받은 그대로 브로드캐스트 (pass-through)
        String destination = "/topic/rooms/" + roomId + "/cursor";
        messagingTemplate.convertAndSend(destination, cursorPosition);

        log.debug("Cursor broadcast: roomId={}, userId={}, x={}, y={}",
                roomId, cursorPosition.userId(), cursorPosition.x(), cursorPosition.y());
    }
}
