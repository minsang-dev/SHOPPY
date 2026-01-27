package ssafy.rtc.shoppy.settlement.dto;

import lombok.Data;
import ssafy.rtc.shoppy.settlement.service.SettlementService;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SettlementCreateRequest {
    private Long payerMemberId;
    private BigDecimal totalAmount;
    private List<SettlementService.PurchaseItemDto> items;
}
