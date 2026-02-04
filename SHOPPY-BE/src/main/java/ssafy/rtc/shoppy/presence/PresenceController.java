package ssafy.rtc.shoppy.presence;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

@RestController
@RequestMapping("/rooms/{roomId}/presence")
@RequiredArgsConstructor
@Tag(name = "Presence API", description = "Presence heartbeat API")
public class PresenceController {

    private final PresenceService presenceService;

    @PostMapping("/heartbeat")
    @Operation(summary = "Presence heartbeat", description = "Update lastSeen and keep presence active.")
    public ResponseEntity<SuccessResponse<Void>> heartbeat(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @RequestBody(required = false) PresenceHeartbeatRequestDto request,
            @RequestHeader(name = "X-Client-Id", required = false) String clientIdHeader
    ) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        String clientId = request != null ? request.clientId() : null;
        if (clientId == null || clientId.isBlank()) {
            clientId = clientIdHeader;
        }
        if (clientId == null || clientId.isBlank()) {
            throw new BusinessException(ErrorCode.MISSING_FIELD);
        }

        presenceService.heartbeat(roomId, userId, clientId);
        return ResponseEntity.ok(SuccessResponse.ok("heartbeat"));
    }
}
