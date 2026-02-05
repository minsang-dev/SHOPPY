package ssafy.rtc.shoppy.ai.llm.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateResponseDto;
import ssafy.rtc.shoppy.ai.llm.service.AiRoomService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

@RestController
@RequestMapping("/rooms")
@Tag(name = "AI Room API", description = "AI 체크리스트용 룸 생성")
@RequiredArgsConstructor
public class AiRoomController {

    private final AiRoomService aiRoomService;

    @PostMapping("/ai/LLM")
    @Operation(summary = "AI 방 생성", description = "AI 체크리스트 생성용 방을 생성합니다.")
    public ResponseEntity<SuccessResponse<AiRoomCreateResponseDto>> createAiRoom(
            @AuthenticationPrincipal Long hostId,
            @Valid @RequestBody AiRoomCreateRequestDto request
    ) {
        AiRoomCreateResponseDto response = aiRoomService.createRoomWithChecklist(request, hostId);
        return ResponseEntity.ok(SuccessResponse.of(response));
    }
}
