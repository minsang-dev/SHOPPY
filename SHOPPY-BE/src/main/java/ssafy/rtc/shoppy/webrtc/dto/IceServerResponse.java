package ssafy.rtc.shoppy.webrtc.dto;

import java.util.List;

public record IceServerResponse(List<String> urls, String username, String credential) {
}
