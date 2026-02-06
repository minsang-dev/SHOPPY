package ssafy.rtc.shoppy.auth.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import ssafy.rtc.shoppy.ai.config.CorsProperties;
import ssafy.rtc.shoppy.auth.controller.AuthController;
import ssafy.rtc.shoppy.auth.jwt.JwtTokenProvider;
import ssafy.rtc.shoppy.auth.service.AuthService;
import ssafy.rtc.shoppy.auth.service.TokenBlacklistService;
import ssafy.rtc.shoppy.room.controller.RoomController;
import ssafy.rtc.shoppy.room.service.RoomMemberService;
import ssafy.rtc.shoppy.room.service.RoomService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {RoomController.class, AuthController.class})
@Import(SecurityConfig.class)
@DisplayName("SecurityConfig 엔드포인트 인증 테스트")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private RoomService roomService;

    @MockitoBean
    private RoomMemberService roomMemberService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CorsProperties corsProperties;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    /**
     * 인증 거부 확인: 401 또는 403 반환.
     * formLogin/httpBasic 비활성화 시 Spring Security는 403을 반환할 수 있음.
     */
    private static ResultMatcher statusDenied() {
        return result -> {
            int code = result.getResponse().getStatus();
            assert code == 401 || code == 403
                    : "Expected 401 or 403 but got " + code;
        };
    }

    /**
     * 공개 엔드포인트 확인: 401/403이 아닌 다른 상태코드 반환.
     */
    private static ResultMatcher statusNotDenied() {
        return result -> {
            int code = result.getResponse().getStatus();
            assert code != 401 && code != 403
                    : "Expected not 401/403 but got " + code;
        };
    }

    @Nested
    @DisplayName("공개 엔드포인트 - 토큰 없이 접근 가능")
    class PublicEndpointTest {

        @Test
        @DisplayName("GET /rooms/{roomId} - 방 정보 조회")
        void getRoomById_noAuth() throws Exception {
            mockMvc.perform(get("/rooms/1"))
                    .andExpect(statusNotDenied());
        }

        @Test
        @DisplayName("GET /rooms/code/{roomCode} - 코드로 방 조회")
        void getRoomByCode_noAuth() throws Exception {
            mockMvc.perform(get("/rooms/code/ABC123"))
                    .andExpect(statusNotDenied());
        }

        @Test
        @DisplayName("GET /rooms/{roomId}/members - 방 멤버 목록")
        void getRoomMembers_noAuth() throws Exception {
            mockMvc.perform(get("/rooms/1/members"))
                    .andExpect(statusNotDenied());
        }

        @Test
        @DisplayName("POST /rooms/join/guest - 게스트 입장")
        void joinAsGuest_noAuth() throws Exception {
            mockMvc.perform(post("/rooms/join/guest")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"roomCode\":\"ABC123\",\"nickname\":\"guest\"}"))
                    .andExpect(statusNotDenied());
        }

        @Test
        @DisplayName("GET /auth/kakao/login - 카카오 로그인 URL")
        void kakaoLogin_noAuth() throws Exception {
            mockMvc.perform(get("/auth/kakao/login"))
                    .andExpect(statusNotDenied());
        }
    }

    @Nested
    @DisplayName("인증 필요 엔드포인트 - 토큰 없으면 거부")
    class ProtectedEndpointTest {

        @Test
        @DisplayName("POST /rooms - 방 생성")
        void createRoom_noAuth() throws Exception {
            mockMvc.perform(post("/rooms")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"roomName\":\"test\",\"targetBudget\":10000}"))
                    .andExpect(statusDenied());
        }

        @Test
        @DisplayName("POST /rooms/join - 회원 입장")
        void joinAsUser_noAuth() throws Exception {
            mockMvc.perform(post("/rooms/join")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"roomCode\":\"ABC123\"}"))
                    .andExpect(statusDenied());
        }

        @Test
        @DisplayName("DELETE /rooms/{roomId}/leave - 방 퇴장")
        void leaveRoom_noAuth() throws Exception {
            mockMvc.perform(delete("/rooms/1/leave"))
                    .andExpect(statusDenied());
        }

        @Test
        @DisplayName("PATCH /rooms/{roomId}/sync-mode - 동기화 모드 변경")
        void updateSyncMode_noAuth() throws Exception {
            mockMvc.perform(patch("/rooms/1/sync-mode")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"syncMode\":\"FREE\"}"))
                    .andExpect(statusDenied());
        }

        @Test
        @DisplayName("POST /rooms/{roomId}/close - 방 종료")
        void closeRoom_noAuth() throws Exception {
            mockMvc.perform(post("/rooms/1/close"))
                    .andExpect(statusDenied());
        }

        @Test
        @DisplayName("POST /auth/logout - 로그아웃")
        void logout_noAuth() throws Exception {
            mockMvc.perform(post("/auth/logout"))
                    .andExpect(statusDenied());
        }
    }
}
