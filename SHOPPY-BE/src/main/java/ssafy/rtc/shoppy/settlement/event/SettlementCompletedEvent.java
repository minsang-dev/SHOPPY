package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementCompletedResponseEvent;

public record SettlementCompletedEvent(
    Long roomId,
    SettlementCompletedResponseEvent response
) {}
