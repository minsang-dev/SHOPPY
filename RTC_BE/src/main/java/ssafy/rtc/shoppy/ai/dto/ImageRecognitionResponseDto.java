package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 첫 단계에서 이미지 분석 결과를 감싼 응답 DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionResponseDto {
    private String imageUrl;
    private List<String> detectedTags;
    private boolean safeContent;
    private List<ImageRecognitionLabelDto> labelDetails;
    private ImageRecognitionSafeSearchDto safeSearch;
}
