package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Vision 웹 감지의 best guess label DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionWebLabelDto {
    private String label;
    private String languageCode;
}
