package ssafy.rtc.shoppy.ai.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionResponseDto;
import ssafy.rtc.shoppy.ai.service.ImageRecognitionService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

import java.util.List;

@RestController
@RequestMapping("/ai/image-recognition")
@Tag(name = "AI Image Recognition", description = "이미지 분석 AI 기능을 위한 엔드포인트")
@RequiredArgsConstructor
public class ImageRecognitionController {

    private final ImageRecognitionService imageRecognitionService;

    @PostMapping("/analyze")
    @Operation(summary = "이미지 태그 분석", description = "이미지 URL과 프롬프트를 받아 AI 분석 결과를 반환합니다.")
    public ResponseEntity<SuccessResponse<List<ImageRecognitionResponseDto>>> analyzeImages(
            @RequestBody List<ImageRecognitionRequestDto> requests
    ) {
        List<ImageRecognitionResponseDto> responses = imageRecognitionService.analyzeImages(requests);

        return ResponseEntity.ok(SuccessResponse.of(responses));
    }
}
