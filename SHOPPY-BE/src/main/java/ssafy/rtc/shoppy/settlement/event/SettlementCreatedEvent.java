package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementCreatedResponseEvent;

public record SettlementCreatedEvent(
    Long roomId,
    SettlementCreatedResponseEvent response
) {}
