package ssafy.rtc.shoppy.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ssafy.rtc.shoppy.global.response.ErrorResponse;

import java.util.HashMap;
import java.util.Map;

/**
 * 전역 예외 처리 핸들러
 * 모든 예외를 ErrorResponse 형식으로 변환합니다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 로직 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse<?>> handleBusinessException(BusinessException e) {
        log.warn("BusinessException occurred: [{}] {}", e.getErrorCode().name(), e.getMessage());

        ErrorResponse<?> errorResponse = e.getErrorData() != null
                ? ErrorResponse.of(e.getErrorCode().name(), e.getMessage(), e.getErrorData())
                : ErrorResponse.of(e.getErrorCode().name(), e.getMessage());

        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(errorResponse);
    }

    /**
     * Validation 예외 처리 (@Valid 실패 시)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse<Map<String, Object>>> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());

        FieldError fieldError = e.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "입력값이 올바르지 않습니다.";

        Map<String, Object> errorData = new HashMap<>();
        if (fieldError != null) {
            errorData.put("field", fieldError.getField());
            errorData.put("value", fieldError.getRejectedValue());
        }

        ErrorResponse<Map<String, Object>> errorResponse = ErrorResponse.of(
                ErrorCode.INVALID_ARGUMENT.name(),
                message,
                errorData
        );

        return ResponseEntity
                .status(ErrorCode.INVALID_ARGUMENT.getHttpStatus())
                .body(errorResponse);
    }

    /**
     * 기타 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse<?>> handleException(Exception e) {
        log.error("Unexpected exception occurred: ", e);

        ErrorResponse<?> errorResponse = ErrorResponse.of(
                ErrorCode.INTERNAL_SERVER_ERROR.name(),
                ErrorCode.INTERNAL_SERVER_ERROR.getMessage()
        );

        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(errorResponse);
    }
}
