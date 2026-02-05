package ssafy.rtc.shoppy.settlement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SettlementDraftItemRequest {
    private Long purchaseItemId;

    @NotBlank(message = "상품명은 필수입니다.")
    private String itemName;

    @NotNull(message = "단가는 필수입니다.")
    @Min(value = 0, message = "단가는 0 이상이어야 합니다.")
    private BigDecimal unitPrice;

    @Min(value = 1, message = "수량은 1 이상이어야 합니다.")
    private int quantity;

    private Long payerMemberId;
    private String payerBankName;
    private String payerAccountNumber;
    private List<Long> participantIds;
}
