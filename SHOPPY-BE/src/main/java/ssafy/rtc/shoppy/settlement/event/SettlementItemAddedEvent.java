package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementItemAddedResponseEvent;

public record SettlementItemAddedEvent(
    Long roomId,
    SettlementItemAddedResponseEvent response
) {}
