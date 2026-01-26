package ssafy.rtc.shoppy.ai.llm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistEntity;

import java.util.Optional;

public interface AiChecklistRepository extends JpaRepository<AiChecklistEntity, Long> {

    Optional<AiChecklistEntity> findByRoomId(Long roomId);

    void deleteByRoomId(Long roomId);
}
