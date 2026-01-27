package ssafy.rtc.shoppy.settlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.settlement.entity.ItemAllocation;

import java.util.List;

@Repository
public interface ItemAllocationRepository extends JpaRepository<ItemAllocation, Long> {
    List<ItemAllocation> findByPurchaseItem_PurchaseItemId(Long purchaseItemId);
    List<ItemAllocation> findByMemberId(Long memberId);
}
