package ssafy.rtc.shoppy.ai.ocr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceiptOcrAnalysisResponse {
    // OCR 분석 결과 메타 + 아이템을 FE에 전달하는 응답 DTO
    private Long ocrAnalysisId;
    private Long receiptId;
    private Long purchaseId;
    private Long roomId;
    private Long userId;
    private String model;
    private String status;
    private String currency;
    private List<String> warnings;
    private String errorCode;
    private String errorMessage;
    private Integer processingTimeMs;
    private LocalDateTime createdAt;
    private List<ReceiptItemDto> items;
}