package ssafy.rtc.shoppy.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListResponseDto {
    private List<ShoppingItemResponseDto> items;
}
