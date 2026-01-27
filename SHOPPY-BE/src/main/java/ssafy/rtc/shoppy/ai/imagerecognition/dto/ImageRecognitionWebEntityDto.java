package ssafy.rtc.shoppy.ai.imagerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Vision 웹 감지의 entity DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionWebEntityDto {
    private String entityId;
    private String description;
    private float score;
}
