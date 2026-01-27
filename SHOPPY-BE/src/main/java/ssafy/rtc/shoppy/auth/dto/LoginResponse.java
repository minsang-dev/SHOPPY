package ssafy.rtc.shoppy.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private Long memberId;
    private String nickname;
    private String profileImageUrl;
    private String accessToken;
    private String refreshToken;
    private boolean isNewMember;
}
