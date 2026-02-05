package ssafy.rtc.shoppy.ai.ocr.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.ai.ocr.entity.ReceiptOcrAnalysis;

import java.util.Optional;

public interface ReceiptOcrAnalysisRepository extends JpaRepository<ReceiptOcrAnalysis, Long> {

    /**
     * receiptId 기준 최신 OCR 분석 결과 (items 포함).
     */
    @EntityGraph(attributePaths = "items")
    Optional<ReceiptOcrAnalysis> findTopByReceiptIdOrderByCreatedAtDesc(Long receiptId);

    /**
     * purchaseId 기준 최신 OCR 분석 결과 (items 포함).
     */
    @EntityGraph(attributePaths = "items")
    Optional<ReceiptOcrAnalysis> findTopByPurchaseIdOrderByCreatedAtDesc(Long purchaseId);
}