package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record SettlementCompletedResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long settlementId,
    String status,
    String report
) {}
