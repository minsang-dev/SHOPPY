package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Vision의 로고 감지 결과 DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionLogoDto {
    private String description;
    private float confidence;
}
