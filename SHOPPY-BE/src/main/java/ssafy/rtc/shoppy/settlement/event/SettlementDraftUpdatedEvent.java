package ssafy.rtc.shoppy.settlement.event;

import ssafy.rtc.shoppy.settlement.dto.SettlementDraftUpdatedResponseEvent;

public record SettlementDraftUpdatedEvent(
        Long roomId,
        SettlementDraftUpdatedResponseEvent response
) {}
