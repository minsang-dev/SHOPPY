package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record SettlementItemUpdatedResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long purchaseId,
    Integer totalAmount,
    List<PurchaseItemResponse> items
) {}
