package ssafy.rtc.shoppy.auth.service;

import ssafy.rtc.shoppy.auth.dto.KakaoLoginUrlResponse;
import ssafy.rtc.shoppy.auth.dto.LoginResponse;
import ssafy.rtc.shoppy.auth.dto.TokenRefreshResponse;

public interface AuthService {

    KakaoLoginUrlResponse getKakaoLoginUrl();

    LoginResponse kakaoLogin(String code);

    TokenRefreshResponse refreshToken(String refreshToken);
}
