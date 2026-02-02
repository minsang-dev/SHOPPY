package ssafy.rtc.shoppy.ai.llm.service;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistEntity;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistItemEntity;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistItemRepository;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class AiChecklistServiceTest {

    @Test
    void toggleChecklistItemUpdatesState() {
        AiChecklistRepository checklistRepository = Mockito.mock(AiChecklistRepository.class);
        AiChecklistItemRepository itemRepository = Mockito.mock(AiChecklistItemRepository.class);
        AiChecklistService service = new AiChecklistService(checklistRepository, itemRepository);

        AiChecklistEntity checklist = AiChecklistEntity.withId(1L, 10L);
        AiChecklistItemEntity item = AiChecklistItemEntity.create(checklist, "DRINK", "Water", "500ml", "Reason", 1);

        when(checklistRepository.findByRoomId(anyLong())).thenReturn(Optional.of(checklist));
        when(itemRepository.findByChecklist_ChecklistIdAndChecklistItemId(1L, 100L)).thenReturn(Optional.of(item));

        service.toggleChecklistItem(10L, 100L, true);

        assertTrue(item.isChecked());
    }
}
