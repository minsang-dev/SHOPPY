package ssafy.rtc.shoppy.webrtc.openvidu;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ssafy.rtc.shoppy.webrtc.config.OpenViduProperties;
import ssafy.rtc.shoppy.webrtc.config.WebRtcProperties;

@Service
@RequiredArgsConstructor
public class OpenViduService {

    private final OpenViduClient openViduClient;
    private final OpenViduProperties openViduProperties;
    private final WebRtcProperties webRtcProperties;

    public OpenViduSessionInfo createOrGetSession(Long roomId) {
        String sessionId = webRtcProperties.getSessionIdPrefix() + roomId;
        String resolvedId = openViduClient.createSession(sessionId);
        return new OpenViduSessionInfo(resolvedId, openViduProperties.getUrl());
    }

    public String createToken(String sessionId, OpenViduRole role, String data) {
        return openViduClient.createToken(sessionId, role, data);
    }
}
