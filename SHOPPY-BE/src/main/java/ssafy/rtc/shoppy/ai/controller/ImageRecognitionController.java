package ssafy.rtc.shoppy.ai.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionResponseDto;
import ssafy.rtc.shoppy.ai.service.ImageRecognitionService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
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
        String requestId = UUID.randomUUID().toString();

        long base64Count = requests.stream()
                .filter(req -> StringUtils.hasText(req.getImageBase64()))
                .count();
        long urlCount = requests.stream()
                .filter(req -> StringUtils.hasText(req.getImageUrl()))
                .count();
        String prompts = requests.stream()
                .map(ImageRecognitionRequestDto::getPrompt)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(", "));

        log.info("[{}] Incoming request with {} payloads ({} base64 / {} url). prompts=[{}]", requestId, requests.size(), base64Count, urlCount, prompts);

        List<ImageRecognitionResponseDto> responses = imageRecognitionService.analyzeImages(requests);

        long unsafeCount = responses.stream().filter(resp -> !resp.isSafeContent()).count();
        log.info("[{}] Vision returned {} items ({} flagged as unsafe)", requestId, responses.size(), unsafeCount);

        return ResponseEntity.ok(SuccessResponse.of(responses));
    }
}
