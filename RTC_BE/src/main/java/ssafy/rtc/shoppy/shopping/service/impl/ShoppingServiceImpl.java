package ssafy.rtc.shoppy.shopping.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.product.entity.Product;
import ssafy.rtc.shoppy.product.repository.ProductRepository;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemRequestDto;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;
import ssafy.rtc.shoppy.shopping.repository.ShoppingItemRepository;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@Service
@RequiredArgsConstructor
@Transactional
public class ShoppingServiceImpl implements ShoppingService {

    private final ShoppingItemRepository shoppingItemRepository;
    private final ProductRepository productRepository;

    @Override
    public void addShoppingItem(ShoppingItemRequestDto requestDto, Long userId) {

        // 1. 상품 존재 확인
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다."));

        // 2. 해당 방(Room)에 이미 같은 상품이 담겨있는지 확인
        ShoppingItem item = shoppingItemRepository.findByRoomIdAndProduct_ProductId(
                requestDto.getRoomId(),
                requestDto.getProductId()
        ).orElse(null);

        if (item != null) {
            // 3-1. 이미 존재하면 -> 수량 증가
            item.addQuantity(requestDto.getQuantity());
        } else {
            // 3-2. 없으면 -> 새로 생성
            item = ShoppingItem.builder()
                    .roomId(requestDto.getRoomId())
                    .addedByUserId(userId)
                    .product(product)
                    .displayName(product.getName())
                    .quantity(requestDto.getQuantity())
                    .isCheck(false)
                    .build();

            shoppingItemRepository.save(item);
        }
    }
}