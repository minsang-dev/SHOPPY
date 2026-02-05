package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementItemDeletedResponseEvent;

public record SettlementItemDeletedEvent(
    Long roomId,
    SettlementItemDeletedResponseEvent response
) {}
