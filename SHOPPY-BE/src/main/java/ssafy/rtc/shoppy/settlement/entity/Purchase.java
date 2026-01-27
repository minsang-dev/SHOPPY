package ssafy.rtc.shoppy.settlement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "Purchase")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    private Long purchaseId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "payer_member_id", nullable = false)
    private Long payerMemberId;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "kakao_order_id")
    private String kakaoOrderId;

    // "PENDING", "COMPLETE"
    @Column(name = "status")
    private String status;

    @Builder.Default
    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseItem> purchaseItems = new ArrayList<>();

    public void updateStatus(String status) {
        this.status = status;
    }

    public void addPurchaseItem(PurchaseItem item) {
        this.purchaseItems.add(item);
        item.setPurchase(this);
    }
}
