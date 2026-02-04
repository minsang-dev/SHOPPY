package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record SettlementDraftUpdatedResponseEvent(
        SettlementEventType type,
        Long roomId,
        LocalDateTime updatedAt,
        Long settlementId,
        List<PurchaseItemResponse> items
) {}
