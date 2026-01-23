package ssafy.rtc.shoppy.webrtc.controller;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.webrtc.config.WebRtcProperties;
import ssafy.rtc.shoppy.webrtc.domain.WebRtcSession;
import ssafy.rtc.shoppy.webrtc.dto.IceServerResponse;
import ssafy.rtc.shoppy.webrtc.dto.WebRtcNetworkStatsRequest;
import ssafy.rtc.shoppy.webrtc.dto.WebRtcQualityProfileResponse;
import ssafy.rtc.shoppy.webrtc.dto.WebRtcSessionRequest;
import ssafy.rtc.shoppy.webrtc.dto.WebRtcSessionResponse;
import ssafy.rtc.shoppy.webrtc.openvidu.OpenViduRole;
import ssafy.rtc.shoppy.webrtc.openvidu.OpenViduService;
import ssafy.rtc.shoppy.webrtc.openvidu.OpenViduSessionInfo;
import ssafy.rtc.shoppy.webrtc.quality.WebRtcQualityProfile;
import ssafy.rtc.shoppy.webrtc.quality.WebRtcQualityService;
import ssafy.rtc.shoppy.webrtc.service.WebRtcSessionService;

@RestController
@RequestMapping("/api/rooms/{roomId}/webrtc")
@RequiredArgsConstructor
@Validated
public class WebRtcController {

    private final WebRtcSessionService webRtcSessionService;
    private final OpenViduService openViduService;
    private final WebRtcQualityService webRtcQualityService;
    private final WebRtcProperties webRtcProperties;

    @PostMapping("/sessions")
    public SuccessResponse<WebRtcSessionResponse> createSession(
            @PathVariable Long roomId,
            @RequestBody(required = false) WebRtcSessionRequest request
    ) {
        OpenViduRole role = OpenViduRole.from(request == null ? null : request.role());
        String data = request == null ? null : request.data();

        // 1. 외부 API 호출 먼저 수행
        OpenViduSessionInfo openViduSession = openViduService.createOrGetSession(roomId);
        String token = openViduService.createToken(openViduSession.sessionId(), role, data);

        // 2. 외부 API 성공 후 DB 작업 수행
        WebRtcSession session = webRtcSessionService.getOrCreate(roomId, webRtcProperties.getDefaultMaxParticipants());

        WebRtcSessionResponse response = new WebRtcSessionResponse(
                openViduSession.sessionId(),
                token,
                openViduSession.serverUrl(),
                session.getMaxParticipants(),
                toIceServerResponses(webRtcProperties.getIceServers())
        );

        return SuccessResponse.of(response);
    }

    @PostMapping("/quality/recommendation")
    public SuccessResponse<WebRtcQualityProfileResponse> recommendQuality(
            @Valid @RequestBody WebRtcNetworkStatsRequest request
    ) {
        WebRtcQualityProfile profile = webRtcQualityService.recommend(request);
        return SuccessResponse.of(toResponse(profile));
    }

    @GetMapping("/quality/profiles")
    public SuccessResponse<List<WebRtcQualityProfileResponse>> listProfiles() {
        List<WebRtcQualityProfileResponse> profiles = webRtcQualityService.listProfiles().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return SuccessResponse.of(profiles);
    }

    private WebRtcQualityProfileResponse toResponse(WebRtcQualityProfile profile) {
        return new WebRtcQualityProfileResponse(
                profile.name(),
                profile.getWidth(),
                profile.getHeight(),
                profile.getMaxFps(),
                profile.getMaxBitrateKbps()
        );
    }

    private List<IceServerResponse> toIceServerResponses(List<WebRtcProperties.IceServer> iceServers) {
        return iceServers.stream()
                .map(server -> new IceServerResponse(server.getUrls(), server.getUsername(), server.getCredential()))
                .collect(Collectors.toList());
    }
}
