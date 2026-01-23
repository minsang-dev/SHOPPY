package ssafy.rtc.shoppy.ai.dto;

import com.google.cloud.vision.v1.SafeSearchAnnotation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Safe Search 분석 결과를 담습니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionSafeSearchDto {
    private String adult;
    private String violence;
    private String racy;

    public static ImageRecognitionSafeSearchDto from(SafeSearchAnnotation annotation) {
        if (annotation == null) {
            return ImageRecognitionSafeSearchDto.builder()
                    .adult(null)
                    .violence(null)
                    .racy(null)
                    .build();
        }
        return ImageRecognitionSafeSearchDto.builder()
                .adult(annotation.getAdult().name())
                .violence(annotation.getViolence().name())
                .racy(annotation.getRacy().name())
                .build();
    }
}
