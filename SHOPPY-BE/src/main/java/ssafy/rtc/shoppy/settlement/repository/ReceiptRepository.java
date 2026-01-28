package ssafy.rtc.shoppy.settlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.settlement.entity.Receipt;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
}
