package ssafy.rtc.shoppy.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.auth.entity.Member;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

/**
 * 테스트용 인증 컨트롤러
 * 프로덕션 환경에서는 비활성화됩니다.
 */
@Slf4j
@RestController
@RequestMapping("/auth/test")
@RequiredArgsConstructor
@Tag(name = "Test Auth API", description = "테스트용 인증 API (개발 전용)")
@Profile("!prod")  // 프로덕션 환경에서는 비활성화
public class TestAuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    @PostMapping("/token/{userId}")
    @Operation(summary = "테스트용 JWT 발급", description = "userId로 JWT를 발급합니다. 개발/테스트 전용입니다.")
    public ResponseEntity<SuccessResponse<TestTokenResponseDto>> generateTestToken(
            @PathVariable Long userId
    ) {
        // Member 존재 확인
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(userId);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        TestTokenResponseDto response = new TestTokenResponseDto(
                userId,
                member.getNickname(),
                accessToken,
                refreshToken
        );

        log.warn("⚠️ TEST JWT ISSUED - UserId: {}, Nickname: {}", userId, member.getNickname());

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @PostMapping("/create-test-user")
    @Operation(summary = "테스트 사용자 생성", description = "테스트용 사용자를 생성하고 JWT를 발급합니다.")
    public ResponseEntity<SuccessResponse<TestUserResponseDto>> createTestUser(
            @RequestParam(required = false, defaultValue = "테스트유저") String nickname
    ) {
        // 테스트 사용자 생성
        Member testMember = Member.builder()
                .oauthId("test-" + System.currentTimeMillis())
                .provider("TEST")
                .nickname(nickname)
                .email("test@test.com")
                .build();

        Member savedMember = memberRepository.save(testMember);

        // JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(savedMember.getUserId());
        String refreshToken = jwtTokenProvider.createRefreshToken(savedMember.getUserId());

        TestUserResponseDto response = new TestUserResponseDto(
                savedMember.getUserId(),
                savedMember.getNickname(),
                accessToken,
                refreshToken
        );

        log.warn("⚠️ TEST USER CREATED - UserId: {}, Nickname: {}",
                savedMember.getUserId(), savedMember.getNickname());

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    public record TestTokenResponseDto(
            Long userId,
            String nickname,
            String accessToken,
            String refreshToken
    ) {}

    public record TestUserResponseDto(
            Long userId,
            String nickname,
            String accessToken,
            String refreshToken
    ) {}
}
