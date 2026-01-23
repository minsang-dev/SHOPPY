package ssafy.rtc.shoppy.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.dto.RoomCreateRequestDto;
import ssafy.rtc.shoppy.room.dto.RoomMetaDto;
import ssafy.rtc.shoppy.room.dto.RoomResponseDto;
import ssafy.rtc.shoppy.room.service.RoomService;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "Room API", description = "방 관리 API")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "방 생성", description = "새로운 쇼핑 방을 생성합니다.")
    public ResponseEntity<SuccessResponse<RoomResponseDto>> createRoom(
            @Valid @RequestBody RoomCreateRequestDto request
    ) {
        Long hostId = 1L;

        Room room = roomService.createRoom(
                request.roomName(),
                request.targetBudget(),
                request.syncMode(),
                hostId
        );

        RoomMetaDto responseMeta = RoomMetaDto.copyWithBudgetMax(request.roomMeta(), request.targetBudget());
        RoomResponseDto response = RoomResponseDto.from(room, responseMeta);

        return ResponseEntity.ok(SuccessResponse.of(response));
    }
}
