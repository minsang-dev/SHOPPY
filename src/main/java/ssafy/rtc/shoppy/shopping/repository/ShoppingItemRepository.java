package ssafy.rtc.shoppy.shopping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

import java.util.List;
import java.util.Optional;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {
    // 상품 ID가 있는 경우 중복 체크
    Optional<ShoppingItem> findByRoomIdAndAddedByUserIdAndProduct_ProductId(Long roomId, Long userId, Long productId);
    
    // 상품 ID가 없는 경우(직접 입력) 이름으로 중복 체크 (선택 사항)
    Optional<ShoppingItem> findByRoomIdAndAddedByUserIdAndDisplayNameAndProductIsNull(Long roomId, Long userId, String displayName);

    // 방 별 장바구니 목록 조회
    List<ShoppingItem> findByRoomId(Long roomId);
}
