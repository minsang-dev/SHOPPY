package ssafy.rtc.shoppy.settlement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "ItemAllocation")
public class ItemAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_item_id", nullable = false)
    private PurchaseItem purchaseItem;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    // 사용자가 실제로 부담하는 금액 (소수점 버림)
    @Column(name = "amount_to_pay", nullable = false)
    private BigDecimal amountToPay;

    // 서버가 부담하는 자투리 금액
    @Column(name = "diff_amount", nullable = false)
    private BigDecimal diffAmount;

    // 0:대기, 1:완료, 2:실패
    @Column(name = "settlement_status", nullable = false)
    private Integer settlementStatus;

    public void updateSettlementStatus(Integer status) {
        this.settlementStatus = status;
    }

    public void updateAmount(BigDecimal amountToPay, BigDecimal diffAmount) {
        this.amountToPay = amountToPay;
        this.diffAmount = diffAmount;
    }
}
