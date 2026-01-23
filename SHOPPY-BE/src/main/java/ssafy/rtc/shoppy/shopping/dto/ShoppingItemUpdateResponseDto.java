package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

@Getter
@Builder
public class ShoppingItemUpdateResponseDto {

    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("is_checked")
    private boolean isChecked;

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
