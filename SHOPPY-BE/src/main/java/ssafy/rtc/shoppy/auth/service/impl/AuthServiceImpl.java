package ssafy.rtc.shoppy.auth.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import ssafy.rtc.shoppy.auth.config.KakaoProperties;
import ssafy.rtc.shoppy.auth.dto.*;
import ssafy.rtc.shoppy.auth.entity.Member;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.auth.service.AuthService;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final String PROVIDER_KAKAO = "KAKAO";

    private final KakaoProperties kakaoProperties;
    private final WebClient webClient;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public KakaoLoginUrlResponse getKakaoLoginUrl() {
        String authorizationUrl = UriComponentsBuilder
                .fromUriString(kakaoProperties.getAuthorizationUri())
                .queryParam("client_id", kakaoProperties.getClientId())
                .queryParam("redirect_uri", kakaoProperties.getRedirectUri())
                .queryParam("response_type", "code")
                .build()
                .toUriString();

        return KakaoLoginUrlResponse.builder()
                .authorizationUrl(authorizationUrl)
                .build();
    }

    @Override
    @Transactional
    public LoginResponse kakaoLogin(String code) {
        KakaoTokenResponse tokenResponse = getKakaoToken(code);
        KakaoUserInfo userInfo = getKakaoUserInfo(tokenResponse.getAccessToken());

        String oauthId = String.valueOf(userInfo.getId());
        Optional<Member> existingMember = memberRepository.findByOauthIdAndProvider(oauthId, PROVIDER_KAKAO);
        boolean isNewMember = existingMember.isEmpty();

        Member member;
        if (isNewMember) {
            member = Member.builder()
                    .oauthId(oauthId)
                    .provider(PROVIDER_KAKAO)
                    .email(userInfo.getEmail())
                    .nickname(userInfo.getNickname())
                    .profileImage(userInfo.getProfileImageUrl())
                    .build();
            member = memberRepository.save(member);
            log.info("New member registered: oauthId={}, provider={}, nickname={}", oauthId, PROVIDER_KAKAO, userInfo.getNickname());
        } else {
            member = existingMember.get();
            member.updateProfile(userInfo.getNickname(), userInfo.getProfileImageUrl());
            log.info("Existing member logged in: oauthId={}, provider={}, nickname={}", oauthId, PROVIDER_KAKAO, userInfo.getNickname());
        }

        String accessToken = jwtTokenProvider.createAccessToken(member.getUserId());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getUserId());

        member.updateRefreshToken(refreshToken);

        return LoginResponse.builder()
                .memberId(member.getUserId())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImage())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .isNewMember(isNewMember)
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            if (jwtTokenProvider.isExpired(refreshToken)) {
                throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
            }
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        Member member = memberRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID));

        String newAccessToken = jwtTokenProvider.createAccessToken(member.getUserId());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(member.getUserId());

        member.updateRefreshToken(newRefreshToken);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private KakaoTokenResponse getKakaoToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoProperties.getClientId());
        formData.add("redirect_uri", kakaoProperties.getRedirectUri());
        formData.add("code", code);

        if (kakaoProperties.getClientSecret() != null && !kakaoProperties.getClientSecret().isEmpty()) {
            formData.add("client_secret", kakaoProperties.getClientSecret());
        }

        try {
            log.info("Requesting Kakao token with code: {}...", code.substring(0, Math.min(10, code.length())));

            KakaoTokenResponse response = webClient.post()
                    .uri(kakaoProperties.getTokenUri())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(body -> {
                                        log.error("Kakao token API error response: {}", body);
                                        return new RuntimeException("Kakao token API error: " + body);
                                    })
                    )
                    .bodyToMono(KakaoTokenResponse.class)
                    .block();

            log.info("Kakao token received successfully, access_token starts with: {}...",
                    response != null && response.getAccessToken() != null
                            ? response.getAccessToken().substring(0, Math.min(10, response.getAccessToken().length()))
                            : "null");

            return response;
        } catch (Exception e) {
            log.error("Failed to get Kakao token: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.KAKAO_TOKEN_FAILED);
        }
    }

    private KakaoUserInfo getKakaoUserInfo(String accessToken) {
        try {
            log.info("Requesting Kakao user info with token: {}...", accessToken.substring(0, Math.min(10, accessToken.length())));

            // 먼저 raw 응답 확인
            String rawResponse = webClient.get()
                    .uri(kakaoProperties.getUserInfoUri())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Kakao user info raw response: {}", rawResponse);

            // JSON 파싱
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            KakaoUserInfo userInfo = mapper.readValue(rawResponse, KakaoUserInfo.class);

            log.info("Kakao user info parsed: id={}, nickname={}",
                    userInfo != null ? userInfo.getId() : null,
                    userInfo != null ? userInfo.getNickname() : null);

            return userInfo;
        } catch (Exception e) {
            log.error("Failed to get Kakao user info: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.KAKAO_USER_INFO_FAILED);
        }
    }
}
