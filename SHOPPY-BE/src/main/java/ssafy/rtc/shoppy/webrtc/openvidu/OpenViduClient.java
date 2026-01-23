package ssafy.rtc.shoppy.webrtc.openvidu;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.webrtc.config.OpenViduProperties;
import ssafy.rtc.shoppy.webrtc.openvidu.dto.OpenViduConnectionResponse;
import ssafy.rtc.shoppy.webrtc.openvidu.dto.OpenViduCreateConnectionRequest;
import ssafy.rtc.shoppy.webrtc.openvidu.dto.OpenViduCreateSessionRequest;
import ssafy.rtc.shoppy.webrtc.openvidu.dto.OpenViduSessionResponse;

@Component
public class OpenViduClient {

    private static final String BASIC_PREFIX = "Basic ";
    private static final String OPENVIDU_USER = "OPENVIDUAPP";

    private final RestClient restClient;

    public OpenViduClient(OpenViduProperties properties, RestClient.Builder builder) {
        String auth = BASIC_PREFIX + Base64.getEncoder()
                .encodeToString((OPENVIDU_USER + ":" + properties.getSecret()).getBytes(StandardCharsets.UTF_8));
        this.restClient = builder
                .baseUrl(trimTrailingSlash(properties.getUrl()))
                .defaultHeader(HttpHeaders.AUTHORIZATION, auth)
                .build();
    }

    public String createSession(String customSessionId) {
        OpenViduCreateSessionRequest request = new OpenViduCreateSessionRequest(customSessionId);
        try {
            OpenViduSessionResponse response = restClient.post()
                    .uri("/openvidu/api/sessions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(OpenViduSessionResponse.class);
            if (response == null || response.id() == null || response.id().isBlank()) {
                throw new BusinessException(ErrorCode.MEDIA_SERVER_UNAVAILABLE, "OpenVidu session id missing.");
            }
            return response.id();
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.CONFLICT) {
                return customSessionId;
            }
            throw new BusinessException(ErrorCode.MEDIA_SERVER_UNAVAILABLE, "OpenVidu session creation failed.");
        }
    }

    public String createToken(String sessionId, OpenViduRole role, String data) {
        OpenViduCreateConnectionRequest request = new OpenViduCreateConnectionRequest(role.name(), data);
        try {
            OpenViduConnectionResponse response = restClient.post()
                    .uri("/openvidu/api/sessions/{sessionId}/connection", sessionId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(OpenViduConnectionResponse.class);
            if (response == null || response.token() == null || response.token().isBlank()) {
                throw new BusinessException(ErrorCode.MEDIA_SERVER_UNAVAILABLE, "OpenVidu token missing.");
            }
            return response.token();
        } catch (RestClientResponseException ex) {
            throw new BusinessException(ErrorCode.MEDIA_SERVER_UNAVAILABLE, "OpenVidu token creation failed.");
        }
    }

    private static String trimTrailingSlash(String baseUrl) {
        if (baseUrl == null) {
            return null;
        }
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }
}
