package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장바구니 아이템 수정 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemUpdateRequestDto {

    @Schema(description = "수량", example = "3")
    @JsonProperty("quantity")
    private Integer quantity;

    @Schema(description = "체크 상태", example = "true")
    @JsonProperty("is_checked")
    private Boolean isChecked;

    @Schema(description = "연결 상품 ID", example = "100")
    @JsonProperty("product_id")
    private Long productId;
}
