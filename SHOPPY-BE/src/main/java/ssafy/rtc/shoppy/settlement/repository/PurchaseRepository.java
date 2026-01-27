package ssafy.rtc.shoppy.settlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.settlement.entity.Purchase;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByRoomId(Long roomId);
    List<Purchase> findByPayerMemberId(Long payerMemberId);
}
