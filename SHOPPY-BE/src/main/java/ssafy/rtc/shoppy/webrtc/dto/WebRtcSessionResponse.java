package ssafy.rtc.shoppy.webrtc.dto;

import java.util.List;

public record WebRtcSessionResponse(
        String sessionId,
        String token,
        String openViduUrl,
        int maxParticipants,
        List<IceServerResponse> iceServers
) {
}
