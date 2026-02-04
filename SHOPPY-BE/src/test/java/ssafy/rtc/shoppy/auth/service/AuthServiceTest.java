package ssafy.rtc.shoppy.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ssafy.rtc.shoppy.auth.config.KakaoProperties;
import ssafy.rtc.shoppy.auth.dto.TokenRefreshResponse;
import ssafy.rtc.shoppy.auth.entity.Member;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.auth.service.impl.AuthServiceImpl;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService 테스트")
class AuthServiceTest {

    @Mock
    private KakaoProperties kakaoProperties;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private Member testMember;

    @BeforeEach
    void setUp() throws Exception {
        testMember = Member.builder()
                .oauthId("12345")
                .provider("KAKAO")
                .email("test@test.com")
                .nickname("테스터")
                .profileImage("http://image.url")
                .build();

        // Reflection으로 userId 설정
        Field userIdField = Member.class.getDeclaredField("userId");
        userIdField.setAccessible(true);
        userIdField.set(testMember, 1L);
    }

    @Nested
    @DisplayName("토큰 갱신 테스트")
    class RefreshTokenTest {

        @Test
        @DisplayName("유효한 Refresh Token으로 토큰 갱신 성공")
        void refreshToken_Success() {
            // given
            String validRefreshToken = "valid-refresh-token";
            String newAccessToken = "new-access-token";
            String newRefreshToken = "new-refresh-token";

            testMember.updateRefreshToken(validRefreshToken);

            when(jwtTokenProvider.validateToken(validRefreshToken)).thenReturn(true);
            when(memberRepository.findByRefreshToken(validRefreshToken)).thenReturn(Optional.of(testMember));
            when(jwtTokenProvider.createAccessToken(anyLong())).thenReturn(newAccessToken);
            when(jwtTokenProvider.createRefreshToken(anyLong())).thenReturn(newRefreshToken);

            // when
            TokenRefreshResponse response = authService.refreshToken(validRefreshToken);

            // then
            assertNotNull(response);
            assertEquals(newAccessToken, response.getAccessToken());
            assertEquals(newRefreshToken, response.getRefreshToken());
            verify(memberRepository).findByRefreshToken(validRefreshToken);
        }

        @Test
        @DisplayName("만료된 Refresh Token으로 갱신 시 REFRESH_TOKEN_EXPIRED 예외 발생")
        void refreshToken_ExpiredToken_ThrowsException() {
            // given
            String expiredToken = "expired-refresh-token";

            when(jwtTokenProvider.validateToken(expiredToken)).thenReturn(false);
            when(jwtTokenProvider.isExpired(expiredToken)).thenReturn(true);

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> authService.refreshToken(expiredToken));

            assertEquals(ErrorCode.REFRESH_TOKEN_EXPIRED, exception.getErrorCode());
        }

        @Test
        @DisplayName("유효하지 않은 Refresh Token으로 갱신 시 REFRESH_TOKEN_INVALID 예외 발생")
        void refreshToken_InvalidToken_ThrowsException() {
            // given
            String invalidToken = "invalid-refresh-token";

            when(jwtTokenProvider.validateToken(invalidToken)).thenReturn(false);
            when(jwtTokenProvider.isExpired(invalidToken)).thenReturn(false);

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> authService.refreshToken(invalidToken));

            assertEquals(ErrorCode.REFRESH_TOKEN_INVALID, exception.getErrorCode());
        }

        @Test
        @DisplayName("DB에 존재하지 않는 Refresh Token으로 갱신 시 REFRESH_TOKEN_INVALID 예외 발생")
        void refreshToken_TokenNotInDb_ThrowsException() {
            // given
            String tokenNotInDb = "token-not-in-db";

            when(jwtTokenProvider.validateToken(tokenNotInDb)).thenReturn(true);
            when(memberRepository.findByRefreshToken(tokenNotInDb)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> authService.refreshToken(tokenNotInDb));

            assertEquals(ErrorCode.REFRESH_TOKEN_INVALID, exception.getErrorCode());
        }

        @Test
        @DisplayName("다른 사용자의 Refresh Token으로 갱신 시도 - DB 조회 실패")
        void refreshToken_OtherUserToken_ThrowsException() {
            // given
            String otherUserToken = "other-user-refresh-token";

            when(jwtTokenProvider.validateToken(otherUserToken)).thenReturn(true);
            when(memberRepository.findByRefreshToken(otherUserToken)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> authService.refreshToken(otherUserToken));

            assertEquals(ErrorCode.REFRESH_TOKEN_INVALID, exception.getErrorCode());
        }
    }

    @Nested
    @DisplayName("로그아웃 테스트")
    class LogoutTest {

        @Test
        @DisplayName("로그아웃 성공 - Refresh Token이 null로 설정됨")
        void logout_Success() {
            // given
            Long memberId = 1L;
            testMember.updateRefreshToken("some-refresh-token");

            when(memberRepository.findById(memberId)).thenReturn(Optional.of(testMember));

            // when
            authService.logout(memberId);

            // then
            assertNull(testMember.getRefreshToken());
            verify(memberRepository).findById(memberId);
        }

        @Test
        @DisplayName("존재하지 않는 회원 로그아웃 시 MEMBER_NOT_FOUND 예외 발생")
        void logout_MemberNotFound_ThrowsException() {
            // given
            Long nonExistentMemberId = 999L;

            when(memberRepository.findById(nonExistentMemberId)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> authService.logout(nonExistentMemberId));

            assertEquals(ErrorCode.MEMBER_NOT_FOUND, exception.getErrorCode());
        }

        @Test
        @DisplayName("이미 로그아웃된 회원 재로그아웃 시도 - 정상 처리")
        void logout_AlreadyLoggedOut_Success() {
            // given
            Long memberId = 1L;
            testMember.updateRefreshToken(null); // 이미 로그아웃 상태

            when(memberRepository.findById(memberId)).thenReturn(Optional.of(testMember));

            // when
            authService.logout(memberId);

            // then
            assertNull(testMember.getRefreshToken());
        }
    }

    @Nested
    @DisplayName("Kakao 로그인 URL 테스트")
    class KakaoLoginUrlTest {

        @Test
        @DisplayName("Kakao 로그인 URL 생성 성공")
        void getKakaoLoginUrl_Success() {
            // given
            when(kakaoProperties.getAuthorizationUri()).thenReturn("https://kauth.kakao.com/oauth/authorize");
            when(kakaoProperties.getClientId()).thenReturn("test-client-id");
            when(kakaoProperties.getRedirectUri()).thenReturn("http://localhost:8080/auth/kakao/callback");

            // when
            var response = authService.getKakaoLoginUrl();

            // then
            assertNotNull(response);
            assertNotNull(response.getAuthorizationUrl());
            assertTrue(response.getAuthorizationUrl().contains("client_id=test-client-id"));
            assertTrue(response.getAuthorizationUrl().contains("response_type=code"));
        }
    }
}
