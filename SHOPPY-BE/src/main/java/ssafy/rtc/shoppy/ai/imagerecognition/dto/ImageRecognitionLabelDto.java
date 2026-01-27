package ssafy.rtc.shoppy.ai.imagerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Google Vision이 반환하는 라벨 정보와 신뢰도를 담는 DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionLabelDto {
    private String label;
    private float confidence;
}
