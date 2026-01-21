package ssafy.rtc.shoppy.shopping.service;

import ssafy.rtc.shoppy.shopping.dto.ShoppingItemRequestDto;

public interface ShoppingService {

    /**
     * 장바구니(쇼핑 아이템) 추가
     * @param requestDto 상품 ID, 방 ID, 수량 정보
     * @param userId 요청한 사용자 ID
     */
    void addShoppingItem(ShoppingItemRequestDto requestDto, Long userId);
}