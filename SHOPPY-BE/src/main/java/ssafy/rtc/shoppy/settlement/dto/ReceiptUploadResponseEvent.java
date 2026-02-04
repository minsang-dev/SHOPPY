package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record ReceiptUploadResponseEvent(
    SettlementEventType type,
    Long roomId,
    LocalDateTime updatedAt,
    Long receiptId,
    Long settlementId,
    String imageUrl,
    List<ReceiptUploadResponse.ItemDto> items
) {}
