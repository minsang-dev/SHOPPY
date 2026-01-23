package ssafy.rtc.shoppy.webrtc.config;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "webrtc")
public class WebRtcProperties {

    private String sessionIdPrefix = "room-";
    private int defaultMaxParticipants = 4;
    private List<IceServer> iceServers = new ArrayList<>();

    @Getter
    @Setter
    public static class IceServer {
        private List<String> urls = new ArrayList<>();
        private String username;
        private String credential;
    }
}
