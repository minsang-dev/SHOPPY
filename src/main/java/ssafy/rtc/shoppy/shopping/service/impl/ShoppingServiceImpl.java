package ssafy.rtc.shoppy.shopping.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.product.entity.Product;
import ssafy.rtc.shoppy.product.repository.ProductRepository;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemResponseDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingListResponseDto;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;
import ssafy.rtc.shoppy.shopping.repository.ShoppingItemRepository;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShoppingServiceImpl implements ShoppingService {

    private final ShoppingItemRepository shoppingItemRepository;
    private final ProductRepository productRepository;

    @Override
    public void addShoppingItem(Long roomId, ShoppingItemAddRequestDto requestDto) {
        ShoppingItem existingItem = null;

        // 1. 상품 ID가 있는 경우 (상품 선택)
        if (requestDto.getProductId() != null) {
            existingItem = shoppingItemRepository.findByRoomIdAndAddedByUserIdAndProduct_ProductId(
                    roomId,
                    requestDto.getUserId(),
                    requestDto.getProductId()
            ).orElse(null);
        } 
        // 2. 상품 ID가 없는 경우 (직접 입력) - 이름으로 중복 체크
        else if (requestDto.getDisplayName() != null) {
            existingItem = shoppingItemRepository.findByRoomIdAndAddedByUserIdAndDisplayNameAndProductIsNull(
                    roomId,
                    requestDto.getUserId(),
                    requestDto.getDisplayName()
            ).orElse(null);
        }

        if (existingItem != null) {
            // 이미 있으면 수량 증가
            existingItem.addQuantity(requestDto.getQuantity());
        } else {
            // 없으면 새로 생성
            Product product = null;
            String displayName = requestDto.getDisplayName();

            if (requestDto.getProductId() != null) {
                product = productRepository.findById(requestDto.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                // 상품 선택 시 displayName이 없으면 상품명 사용
                if (displayName == null) {
                    displayName = product.getName();
                }
            }

            ShoppingItem newItem = ShoppingItem.builder()
                    .roomId(roomId)
                    .addedByUserId(requestDto.getUserId())
                    .product(product)
                    .displayName(displayName)
                    .quantity(requestDto.getQuantity())
                    .purchaseType(requestDto.getPurchaseType())
                    .expectedUnitPrice(requestDto.getExpectedUnitPrice())
                    .build();

            shoppingItemRepository.save(newItem);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ShoppingListResponseDto getShoppingList(Long roomId) {
        List<ShoppingItem> items = shoppingItemRepository.findByRoomId(roomId);
        
        List<ShoppingItemResponseDto> itemDtos = items.stream()
                .map(ShoppingItemResponseDto::from)
                .collect(Collectors.toList());

        return new ShoppingListResponseDto(itemDtos);
    }
}
