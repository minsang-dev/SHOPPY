package ssafy.rtc.shoppy.ai.service;

import ssafy.rtc.shoppy.ai.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionResponseDto;

import java.util.List;

public interface ImageRecognitionService {
    /**
     * 이미지 URL과 선택적 프롬프트를 받아 태그를 분석하고 안전도를 판별합니다.
     */
    List<ImageRecognitionResponseDto> analyzeImages(List<ImageRecognitionRequestDto> payload);
}
