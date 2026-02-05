package ssafy.rtc.shoppy.webrtc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "openvidu")
public class OpenViduProperties {

    private String url;
    private String publicUrl;
    private String secret;
}
