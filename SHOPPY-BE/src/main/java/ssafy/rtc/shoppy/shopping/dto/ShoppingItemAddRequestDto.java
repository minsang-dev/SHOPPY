package ssafy.rtc.shoppy.shopping.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장바구니 아이템 추가 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemAddRequestDto {

    @Schema(description = "아이템을 추가하는 사용자 ID", example = "1")
    private Long userId;

    @Schema(description = "연결할 상품 ID (직접 입력 시 null)", example = "100", nullable = true)
    private Long productId;

    @Schema(description = "표시 이름 (직접 입력 시 필수)", example = "우유 1L")
    private String displayName;

    @Schema(description = "수량", example = "2")
    private int quantity;

    @Schema(description = "구매 방식 (true: 온라인, false: 오프라인)", example = "true")
    private Boolean purchaseType;

    @Schema(description = "예상 단가", example = "3500")
    private String expectedUnitPrice;
}
