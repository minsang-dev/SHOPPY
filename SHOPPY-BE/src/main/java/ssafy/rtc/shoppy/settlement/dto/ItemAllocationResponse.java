package ssafy.rtc.shoppy.settlement.dto;

import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.settlement.entity.ItemAllocation;

import java.math.BigDecimal;

@Getter
@Builder
public class ItemAllocationResponse {
    private Long allocationId;
    private Long memberId;
    private BigDecimal amountToPay;
    private BigDecimal diffAmount;
    private Integer settlementStatus;

    public static ItemAllocationResponse from(ItemAllocation entity) {
        return ItemAllocationResponse.builder()
                .allocationId(entity.getAllocationId())
                .memberId(entity.getMemberId())
                .amountToPay(entity.getAmountToPay())
                .diffAmount(entity.getDiffAmount())
                .settlementStatus(entity.getSettlementStatus())
                .build();
    }
}
