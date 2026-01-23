package ssafy.rtc.shoppy.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 이미지 인식 요청 페이로드를 담는 DTO.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionRequestDto {
    private String imageUrl;
    private String imageBase64;
    private String prompt;
    private List<String> features;
}
