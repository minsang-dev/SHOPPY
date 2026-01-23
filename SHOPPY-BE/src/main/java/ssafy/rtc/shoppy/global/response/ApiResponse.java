package ssafy.rtc.shoppy.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", "OK", data);
    }
    
    public static ApiResponse<Void> success() {
        return new ApiResponse<>("success", "OK", null);
    }
}
