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
@Table(name = "PurchaseItem")
public class PurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_item_id")
    private Long purchaseItemId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Builder.Default
    @OneToMany(mappedBy = "purchaseItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemAllocation> itemAllocations = new ArrayList<>();

    public void addItemAllocation(ItemAllocation allocation) {
        this.itemAllocations.add(allocation);
        allocation.setPurchaseItem(this);
    }

    public void updateDetails(String itemName, BigDecimal unitPrice, int quantity) {
        this.itemName = itemName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }
}
