package ssafy.rtc.shoppy.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KakaoLoginUrlResponse {

    private String authorizationUrl;
}
