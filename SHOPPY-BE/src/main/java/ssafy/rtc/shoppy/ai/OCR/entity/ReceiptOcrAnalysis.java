package ssafy.rtc.shoppy.ai.ocr.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ssafy.rtc.shoppy.ai.llm.entity.JsonStringListConverter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "receipt_ocr_analysis")
public class ReceiptOcrAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ocr_analysis_id")
    private Long ocrAnalysisId;

    @Column(name = "receipt_id")
    private Long receiptId;

    @Column(name = "purchase_id")
    private Long purchaseId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "user_id")
    private Long userId;

    // 사용한 OCR/LLM 모델 식별자 (예: gpt-5.2-pro)
    @Column(name = "model", nullable = false, length = 50)
    private String model;

    // SUCCESS / FAIL
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    // OCR 결과에 대한 주의/보정 메시지 목록
    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "warnings_json", columnDefinition = "json")
    private List<String> warnings;

    // 실패 시 에러코드/메시지 기록
    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", length = 255)
    private String errorMessage;

    // OCR 처리 시간(ms)
    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 분석 결과 아이템들 (1:N)
    @Builder.Default
    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReceiptOcrItem> items = new ArrayList<>();

    public void addItem(ReceiptOcrItem item) {
        if (item == null) {
            return;
        }
        items.add(item);
        item.setAnalysis(this);
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
