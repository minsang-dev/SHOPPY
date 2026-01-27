package ssafy.rtc.shoppy.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.chat.domain.ChatMessage;
import ssafy.rtc.shoppy.chat.dto.ChatMessageCreateRequestDto;
import ssafy.rtc.shoppy.chat.dto.ChatMessageDto;
import ssafy.rtc.shoppy.chat.dto.ChatMessageEditRequestDto;
import ssafy.rtc.shoppy.chat.dto.ChatMessageListResponseDto;
import ssafy.rtc.shoppy.chat.service.ChatService;
import ssafy.rtc.shoppy.global.response.SuccessResponse;

@Slf4j
@RestController
@RequestMapping("/rooms/{roomId}/chat")
@RequiredArgsConstructor
@Tag(name = "Chat API", description = "채팅 메시지 API")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    @Operation(summary = "채팅 메시지 전송", description = "방에 채팅 메시지를 전송합니다.")
    public ResponseEntity<SuccessResponse<ChatMessageDto>> sendMessage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @Valid @RequestBody ChatMessageCreateRequestDto request
    ) {
        log.info("💬 Sending chat message - UserId from JWT: {}, RoomId: {}", userId, roomId);

        ChatMessage message = chatService.sendMessage(roomId, userId, request.content());
        ChatMessageDto response = ChatMessageDto.from(message);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuccessResponse.of(response));
    }

    @GetMapping
    @Operation(summary = "채팅 히스토리 조회", description = "방의 채팅 히스토리를 조회합니다.")
    public ResponseEntity<SuccessResponse<ChatMessageListResponseDto>> getChatHistory(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PageableDefault(size = 50, page = 0) Pageable pageable
    ) {
        Page<ChatMessage> messagePage = chatService.getChatHistory(roomId, userId, pageable);
        ChatMessageListResponseDto response = ChatMessageListResponseDto.from(messagePage);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(SuccessResponse.of(response));
    }

    @DeleteMapping("/{chatId}")
    @Operation(summary = "채팅 메시지 삭제", description = "채팅 메시지를 삭제합니다. 작성자 또는 방 호스트만 삭제 가능합니다.")
    public ResponseEntity<SuccessResponse<Void>> deleteMessage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PathVariable Long chatId
    ) {
        chatService.deleteMessage(roomId, chatId, userId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(SuccessResponse.of(null));
    }

    @PatchMapping("/{chatId}")
    @Operation(summary = "채팅 메시지 수정", description = "채팅 메시지를 수정합니다. 작성자만 수정 가능합니다.")
    public ResponseEntity<SuccessResponse<ChatMessageDto>> editMessage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId,
            @PathVariable Long chatId,
            @Valid @RequestBody ChatMessageEditRequestDto request
    ) {
        ChatMessage message = chatService.editMessage(roomId, chatId, userId, request.content());
        ChatMessageDto response = ChatMessageDto.from(message);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(SuccessResponse.of(response));
    }
}
