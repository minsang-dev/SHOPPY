package ssafy.rtc.shoppy.global.response;

/**
 * API 성공 응답 형식
 * record를 사용하여 불변성과 간결성을 보장합니다.
 */
public record SuccessResponse<T>(
        String status,
        String message,
        T data
) {
    public SuccessResponse {
        if (status == null) {
            status = "success";
        }
        if (message == null || message.isBlank()) {
            message = "OK";
        }
    }

    /**
     * 성공 응답 생성 (데이터 포함)
     */
    public static <T> SuccessResponse<T> of(T data) {
        return new SuccessResponse<>("success", "OK", data);
    }

    /**
     * 성공 응답 생성 (커스텀 메시지)
     */
    public static <T> SuccessResponse<T> of(String message, T data) {
        return new SuccessResponse<>("success", message, data);
    }

    /**
     * 성공 응답 생성 (데이터 없음)
     */
    public static SuccessResponse<Void> ok() {
        return new SuccessResponse<>("success","OK", null);
    }

    /**
     * 성공 응답 생성 (커스텀 메시지, 데이터 없음)
     */
    public static SuccessResponse<Void> ok(String message) {
        return new SuccessResponse<>("success", message, null);
    }
}
