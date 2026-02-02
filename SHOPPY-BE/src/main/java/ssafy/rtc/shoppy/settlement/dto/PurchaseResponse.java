package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.settlement.entity.Purchase;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class PurchaseResponse {
    private Long purchaseId;
    private Long roomId;
    private Long payerMemberId;
    private BigDecimal totalAmount;
    private String status;
    private List<PurchaseItemResponse> items;

    public static PurchaseResponse from(Purchase entity) {
        return PurchaseResponse.builder()
                .purchaseId(entity.getPurchaseId())
                .roomId(entity.getRoomId())
                .payerMemberId(entity.getPayerMemberId())
                .totalAmount(entity.getTotalAmount())
                .status(entity.getStatus())
                .items(entity.getPurchaseItems().stream()
                        .map(PurchaseItemResponse::from)
                        .toList())
                .build();
    }
}
