package ssafy.rtc.shoppy.ai.ocr.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptItemDto;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalysisResponse;
import ssafy.rtc.shoppy.ai.ocr.entity.ReceiptOcrAnalysis;
import ssafy.rtc.shoppy.ai.ocr.entity.ReceiptOcrItem;
import ssafy.rtc.shoppy.ai.ocr.repository.ReceiptOcrAnalysisRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReceiptOcrAnalysisServiceImpl implements ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrAnalysisService {

    private final ReceiptOcrAnalysisRepository analysisRepository;

    @Value("${gms.ocr.model:gpt-5.2-pro}")
    private String model;

    @Override
    public void saveAnalysis(Long receiptId,
                             Long purchaseId,
                             Long roomId,
                             Long userId,
                             ReceiptOcrAnalyzeData data,
                             String errorCode,
                             String errorMessage,
                             Integer processingTimeMs) {
        // OCR 성공/실패 여부와 상관없이 분석 메타를 저장해 재현 가능하게 함.
        boolean success = data != null;
        String status = success ? "SUCCESS" : "FAIL";
        String currency = success && StringUtils.hasText(data.getCurrency()) ? data.getCurrency() : "KRW";

        ReceiptOcrAnalysis analysis = ReceiptOcrAnalysis.builder()
                .receiptId(receiptId)
                .purchaseId(purchaseId)
                .roomId(roomId)
                .userId(userId)
                .model(model)
                .status(status)
                .currency(currency)
                .warnings(success ? data.getWarnings() : List.of())
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .processingTimeMs(processingTimeMs)
                .build();

        if (success && data.getItems() != null) {
            for (ReceiptItemDto item : data.getItems()) {
                if (item == null) {
                    continue;
                }
                ReceiptOcrItem entity = ReceiptOcrItem.builder()
                        .itemName(item.getName())
                        .unitPrice(toBigDecimal(item.getUnitPrice()))
                        .quantity(item.getQuantity())
                        .amount(toBigDecimal(item.getAmount()))
                        .build();
                analysis.addItem(entity);
            }
        }

        analysisRepository.save(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptOcrAnalysisResponse getLatestByReceiptId(Long receiptId) {
        ReceiptOcrAnalysis analysis = analysisRepository.findTopByReceiptIdOrderByCreatedAtDesc(receiptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "OCR 분석 결과가 없습니다."));
        return toResponse(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptOcrAnalysisResponse getLatestByPurchaseId(Long purchaseId) {
        ReceiptOcrAnalysis analysis = analysisRepository.findTopByPurchaseIdOrderByCreatedAtDesc(purchaseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "OCR 분석 결과가 없습니다."));
        return toResponse(analysis);
    }

    private ReceiptOcrAnalysisResponse toResponse(ReceiptOcrAnalysis analysis) {
        // 엔티티 → DTO 변환 (FE 친화적 형태로 변환)
        List<ReceiptItemDto> items = new ArrayList<>();
        if (analysis.getItems() != null) {
            analysis.getItems().forEach(item -> items.add(
                    ReceiptItemDto.builder()
                            .name(item.getItemName())
                            .unitPrice(item.getUnitPrice() == null ? null : item.getUnitPrice().intValue())
                            .quantity(item.getQuantity())
                            .amount(item.getAmount() == null ? null : item.getAmount().intValue())
                            .build()
            ));
        }

        return ReceiptOcrAnalysisResponse.builder()
                .ocrAnalysisId(analysis.getOcrAnalysisId())
                .receiptId(analysis.getReceiptId())
                .purchaseId(analysis.getPurchaseId())
                .roomId(analysis.getRoomId())
                .userId(analysis.getUserId())
                .model(analysis.getModel())
                .status(analysis.getStatus())
                .currency(analysis.getCurrency())
                .warnings(analysis.getWarnings())
                .errorCode(analysis.getErrorCode())
                .errorMessage(analysis.getErrorMessage())
                .processingTimeMs(analysis.getProcessingTimeMs())
                .createdAt(analysis.getCreatedAt())
                .items(items)
                .build();
    }

    private BigDecimal toBigDecimal(Integer value) {
        if (value == null) {
            return null;
        }
        return BigDecimal.valueOf(value);
    }
}