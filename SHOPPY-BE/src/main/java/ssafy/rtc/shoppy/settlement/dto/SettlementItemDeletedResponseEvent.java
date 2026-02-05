package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record SettlementItemDeletedResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long settlementItemId,
    Long purchaseId
) {}
