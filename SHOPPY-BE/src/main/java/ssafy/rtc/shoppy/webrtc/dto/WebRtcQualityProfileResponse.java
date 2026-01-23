package ssafy.rtc.shoppy.webrtc.dto;

public record WebRtcQualityProfileResponse(
        String name,
        int width,
        int height,
        int maxFps,
        int maxBitrateKbps
) {
}
