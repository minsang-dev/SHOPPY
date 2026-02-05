package ssafy.rtc.shoppy.settlement.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ssafy.rtc.shoppy.ai.config.CorsProperties;
import ssafy.rtc.shoppy.auth.config.SecurityConfig;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.service.TokenBlacklistService;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.settlement.dto.ReceiptUploadResponse;
import ssafy.rtc.shoppy.settlement.service.SettlementService;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SettlementController.class)
@Import(SecurityConfig.class)
@DisplayName("SettlementController 테스트")
class SettlementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SettlementService settlementService;

    @MockitoBean
    private RoomMemberRepository roomMemberRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CorsProperties corsProperties;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @Nested
    @DisplayName("영수증 업로드 - POST /rooms/{roomId}/settlements/receipt")
    class UploadReceiptTest {

        private final MockMultipartFile testFile = new MockMultipartFile(
                "file", "receipt.jpg", "image/jpeg", "fake-image".getBytes()
        );

        @Test
        @DisplayName("인증된 유저 + 방 멤버 → 정상 업로드")
        void uploadReceipt_authenticatedAndActiveMember_shouldSucceed() throws Exception {
            // given
            Long roomId = 1L;
            Long userId = 10L;
            Long memberId = 100L;

            RoomMemberEntity mockMember = org.mockito.Mockito.mock(RoomMemberEntity.class);
            when(mockMember.getMemberId()).thenReturn(memberId);

            when(roomMemberRepository.findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE))
                    .thenReturn(Optional.of(mockMember));

            ReceiptUploadResponse mockResponse = ReceiptUploadResponse.builder()
                    .receiptId(1L)
                    .settlementId(1L)
                    .imageUrl("https://example.com/receipt.jpg")
                    .items(Collections.emptyList())
                    .build();

            when(settlementService.uploadReceipt(eq(roomId), eq(memberId), any()))
                    .thenReturn(mockResponse);

            // when & then
            mockMvc.perform(multipart("/rooms/{roomId}/settlements/receipt", roomId)
                            .file(testFile)
                            .with(authentication(new UsernamePasswordAuthenticationToken(
                                    userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                            .with(SecurityMockMvcRequestPostProcessors.csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.receipt_id").value(1));
        }

        @Test
        @DisplayName("인증된 유저 + 방 멤버 아님 → INVALID_ROOM_MEMBER 에러")
        void uploadReceipt_authenticatedButNotMember_shouldFail() throws Exception {
            // given
            Long roomId = 1L;
            Long userId = 99L;

            when(roomMemberRepository.findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE))
                    .thenReturn(Optional.empty());

            // when & then
            mockMvc.perform(multipart("/rooms/{roomId}/settlements/receipt", roomId)
                            .file(testFile)
                            .with(authentication(new UsernamePasswordAuthenticationToken(
                                    userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                            .with(SecurityMockMvcRequestPostProcessors.csrf()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("INVALID_ROOM_MEMBER"));
        }

        @Test
        @DisplayName("비인증 유저 → 401/403 거부")
        void uploadReceipt_unauthenticated_shouldBeDenied() throws Exception {
            mockMvc.perform(multipart("/rooms/1/settlements/receipt")
                            .file(testFile))
                    .andExpect(result -> {
                        int code = result.getResponse().getStatus();
                        assert code == 401 || code == 403
                                : "Expected 401 or 403 but got " + code;
                    });
        }
    }
}
