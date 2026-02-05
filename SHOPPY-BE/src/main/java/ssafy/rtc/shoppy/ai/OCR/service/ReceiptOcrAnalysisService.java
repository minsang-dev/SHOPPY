package ssafy.rtc.shoppy.ai.ocr.service;

import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalysisResponse;

public interface ReceiptOcrAnalysisService {
    /**
     * OCR 결과 저장(헤더 + 아이템).
     * 실패한 경우에도 errorCode/errorMessage를 기록할 수 있도록 설계.
     */
    void saveAnalysis(Long receiptId,
                      Long purchaseId,
                      Long roomId,
                      Long userId,
                      ReceiptOcrAnalyzeData data,
                      String errorCode,
                      String errorMessage,
                      Integer processingTimeMs);

    /**
     * receiptId 기준 최신 OCR 결과 조회.
     */
    ReceiptOcrAnalysisResponse getLatestByReceiptId(Long receiptId);

    /**
     * purchaseId 기준 최신 OCR 결과 조회.
     */
    ReceiptOcrAnalysisResponse getLatestByPurchaseId(Long purchaseId);
}