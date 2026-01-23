package ssafy.rtc.shoppy.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemAddRequestDto {
    private Long userId;
    private Long productId; // null 가능 (직접 입력 시)
    private String displayName; // 직접 입력 시 필수, 상품 선택 시 선택적(상품명 덮어쓰기 등)
    private int quantity;
    private Boolean purchaseType; // true: online, false: offline (스키마 기준)
    private String expectedUnitPrice;
}
