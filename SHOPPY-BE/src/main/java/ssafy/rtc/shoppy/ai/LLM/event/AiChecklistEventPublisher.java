package ssafy.rtc.shoppy.ai.llm.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.ai.llm.dto.AiChecklistItemDeletedDto;
import ssafy.rtc.shoppy.ai.llm.dto.AiChecklistItemToggledDto;

@Component
@RequiredArgsConstructor
public class AiChecklistEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishItemToggled(Long roomId, Long checklistItemId, boolean checked) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/ai-checklist/toggled",
                new AiChecklistItemToggledDto(checklistItemId, checked)
        );
    }

    public void publishItemDeleted(Long roomId, Long checklistItemId) {
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/ai-checklist/deleted",
                new AiChecklistItemDeletedDto(checklistItemId)
        );
    }
}
