package ssafy.rtc.shoppy.shopping.entity;

import jakarta.persistence.*;
import lombok.*;
import ssafy.rtc.shoppy.product.entity.Product;
// import ssafy.rtc.shoppy.room.entity.Room; // Room 엔티티가 있다고 가정
// import ssafy.rtc.shoppy.user.entity.User; // User 엔티티가 있다고 가정

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "shoppingitem")
public class ShoppingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "room_id")
    private Long roomId;
    // 실제로는 @ManyToOne Room room; 으로 작성하는 것이 좋으나,
    // 현재 Room 엔티티 코드가 없으므로 ID로 매핑하거나 추후 수정 필요.
    // 여기서는 편의상 ID 필드로 둡니다.

    @Column(name = "added_by_user_id")
    private Long addedByUserId;
    // 마찬가지로 @ManyToOne User user; 권장

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id") // Nullable (오프라인 아이템일 경우 등)
    private Product product;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "is_check")
    private Boolean isCheck;

    // 비즈니스 로직: 수량 증가
    public void addQuantity(int count) {
        this.quantity += count;
    }

    // 비즈니스 로직: 체크 상태 변경
    public void updateCheckStatus(boolean status) {
        this.isCheck = status;
    }
}