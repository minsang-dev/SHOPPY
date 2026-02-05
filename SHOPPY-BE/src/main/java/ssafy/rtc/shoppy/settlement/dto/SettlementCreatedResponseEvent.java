package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import ssafy.rtc.shoppy.settlement.entity.PurchaseStatus;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record SettlementCreatedResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long purchaseId,
    Long payerMemberId,
    Integer totalAmount,
    PurchaseStatus status,
    List<PurchaseItemResponse> items
) {}
