package ssafy.rtc.shoppy.ai.ocr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceiptOcrAnalyzeData {
    @Builder.Default
    private List<ReceiptItemDto> items = new ArrayList<>();

    @Builder.Default
    private String currency = "KRW";

    @Builder.Default
    private List<String> warnings = new ArrayList<>();

    private ReceiptOcrDebugDto debug;
}