package ssafy.rtc.shoppy.shopping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ShoppingItemRequestDto {

    @JsonProperty("room_id")
    private Long roomId;

    @JsonProperty("product_id")
    private Long productId;

    private Integer quantity;

    // 누가 담았는지는 보통 토큰(SecurityContext)에서 가져오지만,
    // 개발 초기 단계라면 RequestBody로 임시로 받을 수도 있습니다.
    // @JsonProperty("user_id")
    // private Long userId;
}