package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record SettlementItemAddedResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long settlementItemId,
    Long receiptId,
    String itemName,
    Integer unitPrice,
    Integer quantity,
    Integer totalPrice
) {}
