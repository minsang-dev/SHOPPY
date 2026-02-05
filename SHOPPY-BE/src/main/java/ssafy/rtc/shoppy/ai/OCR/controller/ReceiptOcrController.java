package ssafy.rtc.shoppy.ai.ocr.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrService;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai/ocr")
@Tag(name = "[OCR]", description = "영수증 분석(이미지 → GPT 구조화)")
public class ReceiptOcrController {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final ReceiptOcrService receiptOcrService;

    @Operation(summary = "[OCR][REST] 영수증 분석", description = "영수증 이미지 1장을 업로드하면 items[]를 반환합니다.")
    @PostMapping(
            value = "/receipts:analyze",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SuccessResponse<ReceiptOcrAnalyzeData>> analyze(
            @RequestPart("file") MultipartFile file,
            @RequestParam(name = "debug", required = false, defaultValue = "false") boolean debug
    ) {
        validateFile(file);
        ReceiptOcrAnalyzeData data = receiptOcrService.analyze(file, debug);
        return ResponseEntity.ok(SuccessResponse.of(data));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.OCR_400_NO_FILE);
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessException(ErrorCode.OCR_413_FILE_TOO_LARGE);
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED.contains(contentType.toLowerCase())) {
            throw new BusinessException(ErrorCode.OCR_415_UNSUPPORTED_FORMAT);
        }
    }
}
