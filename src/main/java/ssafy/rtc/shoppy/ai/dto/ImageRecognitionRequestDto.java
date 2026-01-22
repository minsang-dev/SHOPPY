package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이미지 분석 요청에서 필요한 데이터 모델.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionRequestDto {
    private String imageUrl;
    private String imageBase64;
    private String prompt;
}
        