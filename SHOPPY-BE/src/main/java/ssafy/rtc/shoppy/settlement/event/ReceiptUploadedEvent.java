package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.ReceiptUploadResponseEvent;

public record ReceiptUploadedEvent(
    Long roomId,
    ReceiptUploadResponseEvent response
) {}
