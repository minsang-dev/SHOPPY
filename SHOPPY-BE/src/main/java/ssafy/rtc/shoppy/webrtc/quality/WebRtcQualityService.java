package ssafy.rtc.shoppy.webrtc.quality;

import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import ssafy.rtc.shoppy.webrtc.dto.WebRtcNetworkStatsRequest;

@Service
public class WebRtcQualityService {

    public WebRtcQualityProfile recommend(WebRtcNetworkStatsRequest stats) {
        Integer rttMs = stats.rttMs();
        Double packetLoss = stats.packetLossRatio();
        Integer uplinkKbps = stats.uplinkKbps();

        if (uplinkKbps != null && uplinkKbps < 500) {
            return WebRtcQualityProfile.LOW;
        }
        if (packetLoss != null && packetLoss > 0.1) {
            return WebRtcQualityProfile.LOW;
        }
        if (rttMs != null && rttMs > 400) {
            return WebRtcQualityProfile.LOW;
        }

        if (uplinkKbps != null && uplinkKbps < 1200) {
            return WebRtcQualityProfile.MEDIUM;
        }
        if (packetLoss != null && packetLoss > 0.05) {
            return WebRtcQualityProfile.MEDIUM;
        }
        if (rttMs != null && rttMs > 250) {
            return WebRtcQualityProfile.MEDIUM;
        }

        return WebRtcQualityProfile.HIGH;
    }

    public List<WebRtcQualityProfile> listProfiles() {
        return Arrays.asList(WebRtcQualityProfile.values());
    }
}
