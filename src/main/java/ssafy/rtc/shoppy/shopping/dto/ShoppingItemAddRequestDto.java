package ssafy.rtc.shoppy.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor // 추가
public class ShoppingItemAddRequestDto {
    private Long roomId;
    private Long userId;
    private Long productId;
    private int quantity;
}