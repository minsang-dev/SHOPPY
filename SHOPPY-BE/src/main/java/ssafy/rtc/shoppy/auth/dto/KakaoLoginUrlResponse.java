package ssafy.rtc.shoppy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "카카오 로그인 URL 응답")
@Getter
@Builder
public class KakaoLoginUrlResponse {

    @Schema(description = "카카오 OAuth 인가 URL", example = "https://kauth.kakao.com/oauth/authorize?...")
    private String authorizationUrl;
}
