package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

@Getter
@Builder
public class ShoppingItemResponseDto {

    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;

    @JsonProperty("room_id")
    private Long roomId;

    @JsonProperty("added_by_user_id")
    private Long addedByUserId;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("display_name")
    private String displayName;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("is_checked")
    private boolean isChecked;

    @JsonProperty("purchase_type")
    private String purchaseType; // "online" or "offline" 변환

    public static ShoppingItemResponseDto from(ShoppingItem item) {
        return ShoppingItemResponseDto.builder()
                .shoppingItemId(item.getShoppingItemId())
                .roomId(item.getRoomId())
                .addedByUserId(item.getAddedByUserId())
                .productId(item.getProduct() != null ? item.getProduct().getProductId() : null)
                .displayName(item.getDisplayName())
                .quantity(item.getQuantity())
                .isChecked(item.isChecked())
                // 스키마의 boolean 타입을 "online"/"offline" 문자열로 변환 (가정)
                // true -> online, false -> offline, null -> null
                .purchaseType(item.getPurchaseType() != null 
                        ? (item.getPurchaseType() ? "online" : "offline") 
                        : null)
                .build();
    }
}
