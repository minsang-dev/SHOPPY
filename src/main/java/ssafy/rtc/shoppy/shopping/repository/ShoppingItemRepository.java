package ssafy.rtc.shoppy.shopping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.shopping.entity.ShoppingItem;

import java.util.Optional;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {
    Optional<ShoppingItem> findByRoomIdAndUserIdAndProduct_ProductId(Long roomId, Long userId, Long productId);
}
