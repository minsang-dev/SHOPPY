package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Schema(description = "장바구니 아이템 삭제 응답")
@Getter
@AllArgsConstructor
public class ShoppingItemDeleteResponseDto {

    @Schema(description = "삭제된 장바구니 아이템 ID", example = "1")
    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;
}
