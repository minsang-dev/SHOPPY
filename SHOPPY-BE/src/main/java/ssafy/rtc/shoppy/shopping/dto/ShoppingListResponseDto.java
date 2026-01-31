package ssafy.rtc.shoppy.shopping.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "장바구니 목록 응답")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListResponseDto {

    @Schema(description = "장바구니 아이템 목록")
    private List<ShoppingItemResponseDto> items;
}
