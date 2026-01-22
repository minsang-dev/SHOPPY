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

    // TODO: 추후 Room 엔티티가 구현되면 @ManyToOne 관계로 변경 필요
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    // TODO: 추후 User 엔티티가 구현되면 @ManyToOne 관계로 변경 필요
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Builder.Default
    @Column(name = "is_checked", nullable = false)
    private boolean isChecked = false;

    public void addQuantity(int quantity) {
        this.quantity += quantity;
    }
}
