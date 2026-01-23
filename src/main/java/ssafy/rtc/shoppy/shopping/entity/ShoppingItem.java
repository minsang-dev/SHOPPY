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

    public void update(Integer quantity, Boolean isChecked, Product product) {
        if (quantity != null) {
            this.quantity = quantity;
        }
        if (isChecked != null) {
            this.isChecked = isChecked;
        }
        // productId가 null로 들어오면 연결 해제, 값이 있으면 변경
        // 단, 요청 DTO에서 productId 필드 자체가 없으면(null) 변경하지 않아야 하는지,
        // 명시적으로 null을 보내면 연결을 끊어야 하는지 정책 결정 필요.
        // 여기서는 DTO의 productId 필드가 존재하면(값이 있든 null이든) 업데이트하는 것으로 가정하지만,
        // 보통 PATCH 방식에서는 null과 "값 없음"을 구분하기 어려우므로,
        // "product_id" 필드가 JSON에 포함되었을 때만 처리하는 것이 이상적입니다.
        // 하지만 간단하게 구현하기 위해, 여기서는 product 객체를 통째로 받아서 처리합니다.
        // (호출하는 쪽에서 변경할 product를 조회해서 넘겨주거나, null을 넘겨주도록)
        
        // 요구사항: "product_id": null -> 연결 해제
        this.product = product;
    }
    
    // 부분 업데이트를 위한 메서드 오버로딩 (Product 변경 없이 수량/체크만 변경 시)
    public void update(Integer quantity, Boolean isChecked) {
        if (quantity != null) {
            this.quantity = quantity;
        }
        if (isChecked != null) {
            this.isChecked = isChecked;
        }
    }
}
