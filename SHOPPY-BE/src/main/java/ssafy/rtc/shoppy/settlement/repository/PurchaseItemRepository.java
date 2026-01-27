package ssafy.rtc.shoppy.settlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.settlement.entity.PurchaseItem;

import java.util.List;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
    List<PurchaseItem> findByPurchase_PurchaseId(Long purchaseId);
}
