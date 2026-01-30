package ssafy.rtc.shoppy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "로그인 응답")
@Getter
@Builder
public class LoginResponse {

    @Schema(description = "회원 ID", example = "1")
    private Long memberId;

    @Schema(description = "닉네임", example = "홍길동")
    private String nickname;

    @Schema(description = "프로필 이미지 URL", example = "https://example.com/profile.jpg")
    private String profileImageUrl;

    @Schema(description = "액세스 토큰", example = "access-token-example")
    private String accessToken;

    @Schema(description = "리프레시 토큰", example = "refresh-token-example")
    private String refreshToken;

    @Schema(description = "신규 회원 여부", example = "true")
    private boolean isNewMember;
}
