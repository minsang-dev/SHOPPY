package ssafy.rtc.shoppy.shopping.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.product.entity.Product;
import ssafy.rtc.shoppy.product.repository.ProductRepository;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemResponseDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemUpdateRequestDto;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemUpdateResponseDto;
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

    @Override
    public ShoppingItemUpdateResponseDto updateShoppingItem(Long roomId, Long shoppingItemId, ShoppingItemUpdateRequestDto requestDto) {
        ShoppingItem item = shoppingItemRepository.findById(shoppingItemId)
                .orElseThrow(() -> new IllegalArgumentException("Shopping item not found"));

        // 방 ID 검증 (잘못된 접근 방지)
        if (!item.getRoomId().equals(roomId)) {
            throw new IllegalArgumentException("Shopping item does not belong to this room");
        }

        // TODO: 권한 체크 (호스트만 가능 등) - 현재는 User/Room 엔티티 미구현으로 생략

        Product product = null;
        // productId가 명시적으로 들어온 경우 (null 포함)
        // 여기서는 DTO의 productId 필드가 null이면 "연결 해제" 또는 "값 없음" 둘 중 하나일 수 있는데,
        // 요구사항 예시("product_id": null)를 보면 null을 보내서 연결을 끊는 기능이 필요함.
        // 하지만 JSON에서 필드 자체가 없는 경우와 null인 경우를 구분하기 어려움.
        // 일단 productId 필드가 있으면 처리하는 로직으로 구현하되,
        // 실제로는 "변경할 필드만 보낸다"는 가정하에 로직을 짭니다.
        
        // 로직 단순화:
        // 1. productId가 null이 아닌 값이 들어오면 -> 해당 Product 조회 후 연결
        // 2. productId가 null이면 -> 연결 해제 (Product = null)
        // 주의: 만약 "productId를 변경하지 않음"을 표현하고 싶다면 DTO 설계가 더 복잡해져야 함 (Optional 등 사용).
        // 현재 요구사항 예시를 보면 모든 필드를 다 보내는 PUT 방식에 가까워 보이기도 하지만,
        // "수량/체크/상품연결"을 수정한다고 했으므로, 들어온 값은 다 반영합니다.
        
        if (requestDto.getProductId() != null) {
            product = productRepository.findById(requestDto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        }
        
        // 업데이트 수행
        // requestDto.getProductId()가 null이면 product도 null이 되어 연결 해제됨
        // 만약 "변경 안 함"을 원한다면 로직 수정 필요. 
        // 여기서는 요청에 포함된 product_id가 null이면 연결을 끊는 것으로 간주.
        item.update(requestDto.getQuantity(), requestDto.getIsChecked(), product);

        return ShoppingItemUpdateResponseDto.from(item);
    }
}
