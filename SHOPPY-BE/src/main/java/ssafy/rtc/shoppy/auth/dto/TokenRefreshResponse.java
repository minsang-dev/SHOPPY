package ssafy.rtc.shoppy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "토큰 갱신 응답")
@Getter
@Builder
public class TokenRefreshResponse {

    @Schema(description = "새로운 액세스 토큰", example = "access-token-example")
    private String accessToken;

    @Schema(description = "새로운 리프레시 토큰", example = "refresh-token-example")
    private String refreshToken;
}
