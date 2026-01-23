package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShoppingItemDeleteResponseDto {
    @JsonProperty("shopping_item_id")
    private Long shoppingItemId;
}
