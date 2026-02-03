package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.settlement.entity.PurchaseItem;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class PurchaseItemResponse {
    private Long purchaseItemId;
    private String itemName;
    private BigDecimal unitPrice;
    private int quantity;
    private Long payerMemberId;
    private String payerBankName;
    private String payerAccountNumber;
    private List<ItemAllocationResponse> allocations;

    public static PurchaseItemResponse from(PurchaseItem entity) {
        return PurchaseItemResponse.builder()
                .purchaseItemId(entity.getPurchaseItemId())
                .itemName(entity.getItemName())
                .unitPrice(entity.getUnitPrice())
                .quantity(entity.getQuantity())
                .payerMemberId(entity.getPayerMemberId())
                .payerBankName(entity.getPayerBankName())
                .payerAccountNumber(entity.getPayerAccountNumber())
                .allocations(entity.getItemAllocations().stream()
                        .map(ItemAllocationResponse::from)
                        .toList())
                .build();
    }
}
