package ssafy.rtc.shoppy.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 에러 코드 정의
 * HTTP 상태코드와 에러 코드를 매핑합니다.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    HOST_URL_REQUIRED(HttpStatus.BAD_REQUEST, "호스트 URL이 필요합니다."),
    SYNC_MODE_NOT_FOLLOW(HttpStatus.BAD_REQUEST, "FOLLOW 모드에서만 가능합니다."),
    INVALID_ARGUMENT(HttpStatus.BAD_REQUEST, "잘못된 요청 값입니다."),
    MISSING_FIELD(HttpStatus.BAD_REQUEST, "필수 필드가 누락되었습니다."),
    INVALID_FORMAT(HttpStatus.BAD_REQUEST, "올바르지 않은 형식입니다."),
    OUT_OF_RANGE(HttpStatus.BAD_REQUEST, "허용 범위를 벗어났습니다."),
    DUPLICATE_VALUE(HttpStatus.BAD_REQUEST, "중복된 값입니다."),

    // 401 Unauthorized
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    KAKAO_AUTH_FAILED(HttpStatus.UNAUTHORIZED, "카카오 인증에 실패했습니다."),
    KAKAO_TOKEN_FAILED(HttpStatus.UNAUTHORIZED, "카카오 토큰 발급에 실패했습니다."),
    KAKAO_USER_INFO_FAILED(HttpStatus.UNAUTHORIZED, "카카오 사용자 정보 조회에 실패했습니다."),
    REFRESH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Refresh Token이 만료되었습니다."),
    REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 Refresh Token입니다."),

    // 403 Forbidden
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    HOST_ONLY(HttpStatus.FORBIDDEN, "호스트만 수행할 수 있습니다."),

    // 404 Not Found
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "방을 찾을 수 없습니다."),
    ROOM_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "방 참여자를 찾을 수 없습니다."),
    INVALID_ROOM_MEMBER(HttpStatus.BAD_REQUEST, "해당 방의 참여자가 아닙니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."),
    VOTE_NOT_FOUND(HttpStatus.NOT_FOUND, "투표를 찾을 수 없습니다."),
    VOTE_OPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "투표 항목을 찾을 수 없습니다."),

    // 409 Conflict
    CONFLICT(HttpStatus.CONFLICT, "리소스 충돌이 발생했습니다."),
    ROOM_ALREADY_CLOSED(HttpStatus.CONFLICT, "이미 종료된 방입니다."),
    ROOM_CLOSED(HttpStatus.BAD_REQUEST, "종료된 방입니다."),
    ROOM_FULL(HttpStatus.CONFLICT, "방 인원이 가득 찼습니다."),
    MEMBER_ALREADY_LEFT(HttpStatus.CONFLICT, "이미 퇴장한 멤버입니다."),
    ALREADY_VOTED(HttpStatus.CONFLICT, "이미 투표에 참여했습니다."),
    VOTE_ALREADY_CLOSED(HttpStatus.CONFLICT, "이미 종료된 투표입니다."),

    // 503 Service Unavailable
    MEDIA_SERVER_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Media server is unavailable."),

    // 500 Internal Server Error
    AI_SERVICE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI 분석 서비스에서 예외가 발생했습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;

    public int getHttpStatusCode() {
        return httpStatus.value();
    }
}
