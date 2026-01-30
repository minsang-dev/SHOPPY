package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

@Schema(description = "장바구니 아이템 응답")
@Getter
@Builder
public class ShoppingItemResponseDto {

    @Schema(description = "장바구니 아이템 ID", example = "1")
    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;

    @Schema(description = "방 ID", example = "10")
    @JsonProperty("room_id")
    private Long roomId;

    @Schema(description = "아이템을 추가한 사용자 ID", example = "5")
    @JsonProperty("added_by_user_id")
    private Long addedByUserId;

    @Schema(description = "연결된 상품 ID", example = "100", nullable = true)
    @JsonProperty("product_id")
    private Long productId;

    @Schema(description = "표시 이름", example = "우유 1L")
    @JsonProperty("display_name")
    private String displayName;

    @Schema(description = "수량", example = "2")
    @JsonProperty("quantity")
    private int quantity;

    @Schema(description = "체크 상태", example = "false")
    @JsonProperty("is_checked")
    private boolean isChecked;

    @Schema(description = "구매 방식 (online/offline)", example = "online")
    @JsonProperty("purchase_type")
    private String purchaseType;

    public static ShoppingItemResponseDto from(ShoppingItem item) {
        return ShoppingItemResponseDto.builder()
                .shoppingItemId(item.getShoppingItemId())
                .roomId(item.getRoomId())
                .addedByUserId(item.getAddedByUserId())
                .productId(item.getProduct() != null ? item.getProduct().getProductId() : null)
                .displayName(item.getDisplayName())
                .quantity(item.getQuantity())
                .isChecked(item.isChecked())
                .purchaseType(item.getPurchaseType() != null
                        ? (item.getPurchaseType() ? "online" : "offline")
                        : null)
                .build();
    }
}
