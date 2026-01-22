package ssafy.rtc.shoppy.shopping.entity;

import jakarta.persistence.*;
import lombok.*;
import ssafy.rtc.shoppy.product.entity.Product;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "ShoppingItem")
public class ShoppingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shopping_item_id")
    private Long shoppingItemId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "added_by_user_id", nullable = false)
    private Long addedByUserId;

    // Product가 null일 수 있음 (직접 입력 아이템)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    private Product product;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "quantity")
    private int quantity;

    @Builder.Default
    @Column(name = "is_checked")
    private boolean isChecked = false;

    // purchase_type: boolean (true: online, false: offline 등으로 가정하거나, 
    // 스키마에는 boolean으로 되어있지만 의미상 Enum이나 String이 더 적합할 수 있음. 
    // 일단 스키마대로 boolean으로 매핑하되, DTO 변환 시 주의 필요)
    @Column(name = "purchase_type")
    private Boolean purchaseType; 

    @Column(name = "expected_unit_price")
    private String expectedUnitPrice;

    public void addQuantity(int quantity) {
        this.quantity += quantity;
    }
}
