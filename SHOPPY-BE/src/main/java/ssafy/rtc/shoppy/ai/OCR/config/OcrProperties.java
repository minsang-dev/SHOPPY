package ssafy.rtc.shoppy.ai.ocr.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ocr")
public class OcrProperties {
    /**
     * OCR 호출 여부 (운영/개발 토글).
     * false면 OCR 분석을 건너뛰고 정산(Purchase)만 생성.
     */
    private boolean enabled = true;
}