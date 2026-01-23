package ssafy.rtc.shoppy.webrtc.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

public record WebRtcNetworkStatsRequest(
        @Min(0) Integer rttMs,
        @DecimalMin("0.0") @DecimalMax("1.0") Double packetLossRatio,
        @Min(0) Integer uplinkKbps
) {
}
