package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

@Schema(description = "장바구니 아이템 수정 응답")
@Getter
@Builder
public class ShoppingItemUpdateResponseDto {

    @Schema(description = "장바구니 아이템 ID", example = "1")
    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;

    @Schema(description = "수량", example = "3")
    @JsonProperty("quantity")
    private int quantity;

    @Schema(description = "체크 상태", example = "true")
    @JsonProperty("is_checked")
    private boolean isChecked;

    @Schema(description = "연결된 상품 ID", example = "100")
    @JsonProperty("product_id")
    private Long productId;

    public static ShoppingItemUpdateResponseDto from(ShoppingItem item) {
        return ShoppingItemUpdateResponseDto.builder()
                .shoppingItemId(item.getShoppingItemId())
                .quantity(item.getQuantity())
                .isChecked(item.isChecked())
                .productId(item.getProduct() != null ? item.getProduct().getProductId() : null)
                .build();
    }
}
