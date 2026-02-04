package ssafy.rtc.shoppy.auth.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Member 엔티티 테스트")
class MemberTest {

    @Nested
    @DisplayName("Member 생성 테스트")
    class MemberCreationTest {

        @Test
        @DisplayName("Builder를 통한 Member 생성 성공")
        void createMember_WithBuilder_Success() {
            // given & when
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .email("test@test.com")
                    .nickname("테스터")
                    .profileImage("http://image.url")
                    .build();

            // then
            assertNull(member.getUserId()); // 저장 전이므로 null
            assertEquals("12345", member.getOauthId());
            assertEquals("KAKAO", member.getProvider());
            assertEquals("test@test.com", member.getEmail());
            assertEquals("테스터", member.getNickname());
            assertEquals("http://image.url", member.getProfileImage());
        }

        @Test
        @DisplayName("필수 필드만으로 Member 생성")
        void createMember_WithRequiredFields_Success() {
            // given & when
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();

            // then
            assertEquals("12345", member.getOauthId());
            assertEquals("KAKAO", member.getProvider());
            assertNull(member.getEmail());
            assertNull(member.getNickname());
        }
    }

    @Nested
    @DisplayName("프로필 업데이트 테스트")
    class ProfileUpdateTest {

        @Test
        @DisplayName("프로필 정보 업데이트 성공")
        void updateProfile_Success() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .nickname("원래이름")
                    .profileImage("http://old-image.url")
                    .build();

            // when
            member.updateProfile("새이름", "http://new-image.url");

            // then
            assertEquals("새이름", member.getNickname());
            assertEquals("http://new-image.url", member.getProfileImage());
        }

        @Test
        @DisplayName("프로필 이미지만 null로 업데이트")
        void updateProfile_NullProfileImage() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .nickname("테스터")
                    .profileImage("http://image.url")
                    .build();

            // when
            member.updateProfile("테스터", null);

            // then
            assertEquals("테스터", member.getNickname());
            assertNull(member.getProfileImage());
        }
    }

    @Nested
    @DisplayName("Refresh Token 업데이트 테스트")
    class RefreshTokenUpdateTest {

        @Test
        @DisplayName("Refresh Token 설정 성공")
        void updateRefreshToken_Success() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();

            // when
            member.updateRefreshToken("new-refresh-token");

            // then
            assertEquals("new-refresh-token", member.getRefreshToken());
        }

        @Test
        @DisplayName("Refresh Token null로 설정 (로그아웃)")
        void updateRefreshToken_SetNull() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();
            member.updateRefreshToken("some-token");

            // when
            member.updateRefreshToken(null);

            // then
            assertNull(member.getRefreshToken());
        }

        @Test
        @DisplayName("Refresh Token 여러 번 업데이트")
        void updateRefreshToken_MultipleUpdates() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();

            // when
            member.updateRefreshToken("token-1");
            member.updateRefreshToken("token-2");
            member.updateRefreshToken("token-3");

            // then
            assertEquals("token-3", member.getRefreshToken());
        }
    }

    @Nested
    @DisplayName("결제 정보 업데이트 테스트")
    class PaymentInfoUpdateTest {

        @Test
        @DisplayName("결제 정보 업데이트 성공")
        void updatePaymentInfo_Success() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();

            // when
            member.updatePaymentInfo("신한은행", "110-123-456789", "http://qr-code.url");

            // then
            assertEquals("신한은행", member.getBankName());
            assertEquals("110-123-456789", member.getAccountNumber());
            assertEquals("http://qr-code.url", member.getQrCodeUrl());
        }

        @Test
        @DisplayName("결제 정보 부분 업데이트 (QR 없이)")
        void updatePaymentInfo_WithoutQrCode() {
            // given
            Member member = Member.builder()
                    .oauthId("12345")
                    .provider("KAKAO")
                    .build();

            // when
            member.updatePaymentInfo("국민은행", "123-456-789012", null);

            // then
            assertEquals("국민은행", member.getBankName());
            assertEquals("123-456-789012", member.getAccountNumber());
            assertNull(member.getQrCodeUrl());
        }
    }
}
