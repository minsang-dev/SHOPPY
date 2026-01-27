package ssafy.rtc.shoppy.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoUserInfo {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    @JsonProperty("properties")
    private Properties properties;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoAccount {

        @JsonProperty("email")
        private String email;

        @JsonProperty("profile")
        private Profile profile;

        @Getter
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Profile {

            @JsonProperty("nickname")
            private String nickname;

            @JsonProperty("profile_image_url")
            private String profileImageUrl;
        }
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Properties {

        @JsonProperty("nickname")
        private String nickname;

        @JsonProperty("profile_image")
        private String profileImage;
    }

    public String getEmail() {
        return kakaoAccount != null ? kakaoAccount.getEmail() : null;
    }

    public String getNickname() {
        // kakao_account.profile에서 먼저 시도, 없으면 properties에서 가져옴
        if (kakaoAccount != null && kakaoAccount.getProfile() != null
                && kakaoAccount.getProfile().getNickname() != null) {
            return kakaoAccount.getProfile().getNickname();
        }
        return properties != null ? properties.getNickname() : null;
    }

    public String getProfileImageUrl() {
        // kakao_account.profile에서 먼저 시도, 없으면 properties에서 가져옴
        if (kakaoAccount != null && kakaoAccount.getProfile() != null
                && kakaoAccount.getProfile().getProfileImageUrl() != null) {
            return kakaoAccount.getProfile().getProfileImageUrl();
        }
        return properties != null ? properties.getProfileImage() : null;
    }
}
