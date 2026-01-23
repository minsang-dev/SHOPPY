package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemUpdateRequestDto {
    
    @JsonProperty("quantity")
    private Integer quantity;
    
    @JsonProperty("is_checked")
    private Boolean isChecked;
    
    @JsonProperty("product_id")
    private Long productId;
}
