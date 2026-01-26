package ssafy.rtc.shoppy.auth.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "nickname", length = 50)
    private String nickname;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "profile_image", length = 1024)
    private String profileImage;

    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "qr_code_url", length = 1024)
    private String qrCodeUrl;

    @Column(name = "oauth_id", unique = true, length = 255)
    private String oauthId;

    @Column(name = "provider", length = 20)
    private String provider;

    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Builder
    public Member(String oauthId, String provider, String email, String nickname, String profileImage) {
        this.oauthId = oauthId;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void updateProfile(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void updatePaymentInfo(String bankName, String accountNumber, String qrCodeUrl) {
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.qrCodeUrl = qrCodeUrl;
    }
}
