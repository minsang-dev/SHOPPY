package ssafy.rtc.shoppy.settlement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class SettlementItemCreateResponse {

    @JsonProperty("settlement_item_id")
    private Long settlementItemId; // purchase_item_id

    @JsonProperty("receipt_id")
    private Long receiptId;

    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("total_price")
    private BigDecimal totalPrice;
}
