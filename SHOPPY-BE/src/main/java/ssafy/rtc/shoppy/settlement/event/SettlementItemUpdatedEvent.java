package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementItemUpdatedResponseEvent;

public record SettlementItemUpdatedEvent(
    Long roomId,
    SettlementItemUpdatedResponseEvent response
) {}
