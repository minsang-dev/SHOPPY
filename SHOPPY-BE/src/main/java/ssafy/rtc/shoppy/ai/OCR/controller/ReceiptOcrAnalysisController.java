package ssafy.rtc.shoppy.ai.ocr.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalysisResponse;
import ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrAnalysisService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai/ocr")
@Tag(name = "[OCR]", description = "영수증 OCR 분석 조회")
public class ReceiptOcrAnalysisController {

    private final ReceiptOcrAnalysisService receiptOcrAnalysisService;

    @Operation(summary = "[OCR][REST] 영수증 OCR 분석 조회", description = "receiptId 기준 최신 OCR 분석 결과를 반환합니다.")
    @GetMapping("/receipts/{receiptId}/analysis")
    public ResponseEntity<SuccessResponse<ReceiptOcrAnalysisResponse>> getByReceiptId(
            @PathVariable Long receiptId
    ) {
        // receiptId 기준 가장 최근 결과를 조회
        ReceiptOcrAnalysisResponse response = receiptOcrAnalysisService.getLatestByReceiptId(receiptId);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @Operation(summary = "[OCR][REST] 구매 OCR 분석 조회", description = "purchaseId 기준 최신 OCR 분석 결과를 반환합니다.")
    @GetMapping("/purchases/{purchaseId}/analysis")
    public ResponseEntity<SuccessResponse<ReceiptOcrAnalysisResponse>> getByPurchaseId(
            @PathVariable Long purchaseId
    ) {
        // purchaseId 기준 가장 최근 결과를 조회
        ReceiptOcrAnalysisResponse response = receiptOcrAnalysisService.getLatestByPurchaseId(purchaseId);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }
}
