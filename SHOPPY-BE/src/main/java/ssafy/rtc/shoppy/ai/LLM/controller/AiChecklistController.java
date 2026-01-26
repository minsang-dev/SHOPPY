package ssafy.rtc.shoppy.ai.llm.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.ai.llm.dto.AiChecklistResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.ToggleChecklistItemRequestDto;
import ssafy.rtc.shoppy.ai.llm.service.AiChecklistService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "AI Checklist API", description = "AI checklist endpoints")
public class AiChecklistController {

    private final AiChecklistService checklistService;

    @GetMapping("/{roomId}/ai-checklist")
    @Operation(summary = "Get AI checklist", description = "Fetch AI checklist for a room.")
    public ResponseEntity<SuccessResponse<AiChecklistResponseDto>> getChecklist(@PathVariable long roomId) {
        return ResponseEntity.ok(SuccessResponse.of(checklistService.getChecklist(roomId)));
    }

    @PatchMapping("/{roomId}/ai-checklist/items/{checklistItemId}")
    @Operation(summary = "Toggle AI checklist item", description = "Update checked state of an AI checklist item.")
    public ResponseEntity<SuccessResponse<Void>> toggleChecklistItem(
            @PathVariable long roomId,
            @PathVariable long checklistItemId,
            @RequestBody ToggleChecklistItemRequestDto request
    ) {
        checklistService.toggleChecklistItem(roomId, checklistItemId, request.checked());
        return ResponseEntity.ok(SuccessResponse.ok());
    }
}
