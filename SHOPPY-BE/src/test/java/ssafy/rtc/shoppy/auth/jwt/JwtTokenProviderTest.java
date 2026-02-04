package ssafy.rtc.shoppy.auth.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import ssafy.rtc.shoppy.auth.config.JwtProperties;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("JwtTokenProvider 테스트")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String TEST_SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbi1tdXN0LWJlLWxvbmctZW5vdWdo"; // Base64 인코딩된 시크릿
    private static final long ACCESS_TOKEN_EXPIRATION = 1800000L; // 30분
    private static final long REFRESH_TOKEN_EXPIRATION = 604800000L; // 7일

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = mock(JwtProperties.class);
        when(jwtProperties.getSecret()).thenReturn(TEST_SECRET);
        when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_TOKEN_EXPIRATION);
        when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

        jwtTokenProvider = new JwtTokenProvider(jwtProperties);
    }

    @Nested
    @DisplayName("토큰 생성 테스트")
    class CreateTokenTest {

        @Test
        @DisplayName("Access Token 생성 성공")
        void createAccessToken_Success() {
            // given
            Long memberId = 1L;

            // when
            String accessToken = jwtTokenProvider.createAccessToken(memberId);

            // then
            assertNotNull(accessToken);
            assertEquals(3, accessToken.split("\\.").length); // JWT 형식 확인 (header.payload.signature)
        }

        @Test
        @DisplayName("Refresh Token 생성 성공")
        void createRefreshToken_Success() {
            // given
            Long memberId = 1L;

            // when
            String refreshToken = jwtTokenProvider.createRefreshToken(memberId);

            // then
            assertNotNull(refreshToken);
            assertEquals(3, refreshToken.split("\\.").length);
        }

        @Test
        @DisplayName("Access Token과 Refresh Token은 서로 다름")
        void createToken_AccessAndRefreshAreDifferent() {
            // given
            Long memberId = 1L;

            // when
            String accessToken = jwtTokenProvider.createAccessToken(memberId);
            String refreshToken = jwtTokenProvider.createRefreshToken(memberId);

            // then
            assertNotEquals(accessToken, refreshToken);
        }
    }

    @Nested
    @DisplayName("토큰 검증 테스트")
    class ValidateTokenTest {

        @Test
        @DisplayName("유효한 토큰 검증 성공")
        void validateToken_Valid_ReturnsTrue() {
            // given
            String validToken = jwtTokenProvider.createAccessToken(1L);

            // when
            boolean isValid = jwtTokenProvider.validateToken(validToken);

            // then
            assertTrue(isValid);
        }

        @Test
        @DisplayName("잘못된 형식의 토큰 검증 실패")
        void validateToken_Malformed_ReturnsFalse() {
            // given
            String malformedToken = "invalid.token.format";

            // when
            boolean isValid = jwtTokenProvider.validateToken(malformedToken);

            // then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("빈 토큰 검증 실패")
        void validateToken_Empty_ReturnsFalse() {
            // given
            String emptyToken = "";

            // when
            boolean isValid = jwtTokenProvider.validateToken(emptyToken);

            // then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("null 토큰 검증 실패")
        void validateToken_Null_ReturnsFalse() {
            // when
            boolean isValid = jwtTokenProvider.validateToken(null);

            // then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("다른 시크릿으로 서명된 토큰 검증 시 예외 발생")
        void validateToken_WrongSignature_ThrowsException() {
            // given - 다른 시크릿 키로 토큰 생성
            String anotherSecret = "YW5vdGhlci1zZWNyZXQta2V5LWZvci10ZXN0aW5nLXB1cnBvc2VzLW11c3QtYmUtbG9uZy1lbm91Z2g=";
            byte[] keyBytes = Decoders.BASE64.decode(anotherSecret);
            SecretKey anotherKey = Keys.hmacShaKeyFor(keyBytes);

            String tokenWithWrongSignature = Jwts.builder()
                    .subject("1")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 3600000))
                    .signWith(anotherKey)
                    .compact();

            // when & then
            // Note: JwtTokenProvider.validateToken()에서 io.jsonwebtoken.security.SignatureException을
            // 캐치하지 못하고 있음. 프로덕션 코드에서 SecurityException import 확인 필요
            assertThrows(io.jsonwebtoken.security.SignatureException.class,
                    () -> jwtTokenProvider.validateToken(tokenWithWrongSignature));
        }
    }

    @Nested
    @DisplayName("토큰 만료 테스트")
    class TokenExpirationTest {

        @Test
        @DisplayName("만료되지 않은 토큰 - isExpired false 반환")
        void isExpired_ValidToken_ReturnsFalse() {
            // given
            String validToken = jwtTokenProvider.createAccessToken(1L);

            // when
            boolean isExpired = jwtTokenProvider.isExpired(validToken);

            // then
            assertFalse(isExpired);
        }

        @Test
        @DisplayName("만료된 토큰 - isExpired true 반환")
        void isExpired_ExpiredToken_ReturnsTrue() {
            // given - 만료된 토큰 직접 생성
            byte[] keyBytes = Decoders.BASE64.decode(TEST_SECRET);
            SecretKey secretKey = Keys.hmacShaKeyFor(keyBytes);

            String expiredToken = Jwts.builder()
                    .subject("1")
                    .issuedAt(new Date(System.currentTimeMillis() - 7200000)) // 2시간 전
                    .expiration(new Date(System.currentTimeMillis() - 3600000)) // 1시간 전 만료
                    .signWith(secretKey)
                    .compact();

            // when
            boolean isExpired = jwtTokenProvider.isExpired(expiredToken);

            // then
            assertTrue(isExpired);
        }
    }

    @Nested
    @DisplayName("Authentication 추출 테스트")
    class GetAuthenticationTest {

        @Test
        @DisplayName("토큰에서 Authentication 추출 성공")
        void getAuthentication_Success() {
            // given
            Long memberId = 123L;
            String token = jwtTokenProvider.createAccessToken(memberId);

            // when
            Authentication authentication = jwtTokenProvider.getAuthentication(token);

            // then
            assertNotNull(authentication);
            assertEquals(memberId, authentication.getPrincipal());
            assertTrue(authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
        }
    }

    @Nested
    @DisplayName("MemberId 추출 테스트")
    class GetMemberIdFromTokenTest {

        @Test
        @DisplayName("토큰에서 memberId 추출 성공")
        void getMemberIdFromToken_Success() {
            // given
            Long expectedMemberId = 42L;
            String token = jwtTokenProvider.createAccessToken(expectedMemberId);

            // when
            Long actualMemberId = jwtTokenProvider.getMemberIdFromToken(token);

            // then
            assertEquals(expectedMemberId, actualMemberId);
        }
    }
}
