package ssafy.rtc.shoppy.ai.llm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistItemEntity;

import java.util.List;
import java.util.Optional;

public interface AiChecklistItemRepository extends JpaRepository<AiChecklistItemEntity, Long> {

    List<AiChecklistItemEntity> findByChecklist_ChecklistIdOrderBySortOrderAsc(Long checklistId);

    Optional<AiChecklistItemEntity> findByChecklist_ChecklistIdAndChecklistItemId(Long checklistId, Long checklistItemId);
}
