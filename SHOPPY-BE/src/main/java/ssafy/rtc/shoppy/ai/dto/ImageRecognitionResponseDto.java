package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private List<ImageRecognitionLogoDto> logos;
    private List<ImageRecognitionTextDto> texts;
    private List<ImageRecognitionWebLabelDto> bestGuessLabels;
    private List<ImageRecognitionWebEntityDto> webEntities;
    private ProductMatchDto finalMatch;
}
