package ssafy.rtc.shoppy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "토큰 갱신 요청")
@Getter
@NoArgsConstructor
public class TokenRefreshRequest {

    @Schema(description = "리프레시 토큰", example = "refresh-token-example")
    @NotBlank(message = "Refresh Token은 필수입니다.")
    private String refreshToken;
}
