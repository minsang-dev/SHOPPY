package ssafy.rtc.shoppy.ai.llm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.ai.llm.entity.RoomConstraintsEntity;

public interface RoomConstraintsRepository extends JpaRepository<RoomConstraintsEntity, Long> {
}
