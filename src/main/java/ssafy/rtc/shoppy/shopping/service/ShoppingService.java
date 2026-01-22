package ssafy.rtc.shoppy.shopping.service;

import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;

public interface ShoppingService {
    void addShoppingItem(Long roomId, ShoppingItemAddRequestDto requestDto);
}
