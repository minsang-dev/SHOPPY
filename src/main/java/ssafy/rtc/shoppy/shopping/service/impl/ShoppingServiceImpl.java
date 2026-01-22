package ssafy.rtc.shoppy.shopping.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.product.entity.Product;
import ssafy.rtc.shoppy.product.repository.ProductRepository;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
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
    public void addShoppingItem(Long roomId, ShoppingItemAddRequestDto requestDto) {
        // 1. 이미 장바구니에 있는지 확인
        ShoppingItem existingItem = shoppingItemRepository.findByRoomIdAndUserIdAndProduct_ProductId(
                roomId,
                requestDto.getUserId(),
                requestDto.getProductId()
        ).orElse(null);

        if (existingItem != null) {
            // 이미 있으면 수량 증가
            existingItem.addQuantity(requestDto.getQuantity());
        } else {
            // 없으면 새로 생성
            Product product = productRepository.findById(requestDto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            ShoppingItem newItem = ShoppingItem.builder()
                    .roomId(roomId)
                    .userId(requestDto.getUserId())
                    .product(product)
                    .quantity(requestDto.getQuantity())
                    .build();

            shoppingItemRepository.save(newItem);
        }
    }
}
