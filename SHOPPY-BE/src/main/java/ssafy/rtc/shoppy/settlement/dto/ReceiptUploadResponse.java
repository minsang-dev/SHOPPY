package ssafy.rtc.shoppy.settlement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ReceiptUploadResponse {
    @JsonProperty("receipt_id")
    private Long receiptId;

    @JsonProperty("settlement_id")
    private Long settlementId;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("items")
    private List<ItemDto> items;

    @Getter
    @Builder
    public static class ItemDto {
        @JsonProperty("item_name")
        private String itemName;
        
        @JsonProperty("unit_price")
        private BigDecimal unitPrice;
        
        @JsonProperty("quantity")
        private int quantity;
    }
}
