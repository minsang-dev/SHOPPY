package ssafy.rtc.shoppy.shopping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

import java.util.Optional;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    // 특정 방(Room)에서 특정 상품(Product)이 이미 담겨있는지 확인
    Optional<ShoppingItem> findByRoomIdAndProduct_ProductId(Long roomId, Long productId);
}