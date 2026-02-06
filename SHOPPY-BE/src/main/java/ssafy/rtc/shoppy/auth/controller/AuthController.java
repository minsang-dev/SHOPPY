package ssafy.rtc.shoppy.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.auth.dto.KakaoLoginUrlResponse;
import ssafy.rtc.shoppy.auth.dto.LoginResponse;
import ssafy.rtc.shoppy.auth.dto.TokenRefreshRequest;
import ssafy.rtc.shoppy.auth.dto.TokenRefreshResponse;
import ssafy.rtc.shoppy.auth.service.AuthService;
import ssafy.rtc.shoppy.global.response.ApiResponse;

@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Kakao 로그인 URL 조회", description = "Kakao OAuth 인가 URL을 반환합니다.")
    @GetMapping("/kakao/login")
    public ResponseEntity<ApiResponse<KakaoLoginUrlResponse>> getKakaoLoginUrl() {
        KakaoLoginUrlResponse response = authService.getKakaoLoginUrl();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Kakao 로그인 콜백", description = "Kakao 인가 코드로 로그인을 처리하고 JWT 토큰을 반환합니다.")
    @GetMapping("/kakao/callback")
    public ResponseEntity<ApiResponse<LoginResponse>> kakaoCallback(
            @Parameter(description = "Kakao 인가 코드") @RequestParam("code") String code) {
        LoginResponse response = authService.kakaoLogin(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "토큰 갱신", description = "Refresh Token으로 새로운 Access Token과 Refresh Token을 발급합니다.")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "로그아웃", description = "현재 사용자를 로그아웃 처리합니다. Refresh Token이 무효화되고 Access Token이 블랙리스트에 등록됩니다.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal Long memberId,
            @RequestHeader("Authorization") String authorization) {
        String accessToken = authorization.substring("Bearer ".length());
        authService.logout(memberId, accessToken);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
