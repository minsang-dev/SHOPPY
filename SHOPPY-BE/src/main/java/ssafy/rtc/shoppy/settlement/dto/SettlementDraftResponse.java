package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SettlementDraftResponse {
    private Long settlementId;
    private Long roomId;
    private LocalDateTime updatedAt;
    private List<PurchaseItemResponse> items;
}
