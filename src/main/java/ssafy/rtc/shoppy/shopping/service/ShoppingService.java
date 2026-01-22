package ssafy.rtc.shoppy.shopping.service;

import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingListResponseDto;

public interface ShoppingService {
    void addShoppingItem(Long roomId, ShoppingItemAddRequestDto requestDto);
    ShoppingListResponseDto getShoppingList(Long roomId);
}
