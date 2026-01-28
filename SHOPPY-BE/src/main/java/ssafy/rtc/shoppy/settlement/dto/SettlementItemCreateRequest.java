package ssafy.rtc.shoppy.settlement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class SettlementItemCreateRequest {

    @NotBlank(message = "상품명은 필수입니다.")
    @JsonProperty("item_name")
    private String itemName;

    @NotNull(message = "단가는 필수입니다.")
    @Min(value = 0, message = "단가는 0원 이상이어야 합니다.")
    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    @Min(value = 1, message = "수량은 1개 이상이어야 합니다.")
    @JsonProperty("quantity")
    private int quantity;
}
