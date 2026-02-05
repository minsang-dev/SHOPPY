package ssafy.rtc.shoppy.ai.ocr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptItemDto {
    private String name;
    private Integer unitPrice;
    private Integer quantity;
    private Integer amount;
}