package ssafy.rtc.shoppy.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.domain.RoomMember;
import ssafy.rtc.shoppy.room.dto.*;
import ssafy.rtc.shoppy.room.service.RoomMemberService;
import ssafy.rtc.shoppy.room.service.RoomService;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "Room API", description = "방 관리 API")
public class RoomController {

    private final RoomService roomService;
    private final RoomMemberService roomMemberService;

    @PostMapping
    @Operation(summary = "방 생성", description = "새로운 쇼핑 방을 생성합니다.")
    public ResponseEntity<SuccessResponse<RoomCreateResponseDto>> createRoom(
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
        RoomCreateResponseDto response = RoomCreateResponseDto.from(room, responseMeta);

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "방 조회", description = "방 ID로 방 정보를 조회합니다.")
    public ResponseEntity<SuccessResponse<RoomResponseDto>> getRoomById(
            @PathVariable Long roomId
    ) {
        Room room = roomService.getRoomById(roomId);
        RoomResponseDto response = RoomResponseDto.from(room);

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @GetMapping("/code/{roomCode}")
    @Operation(summary = "초대 코드로 방 조회", description = "초대 코드(roomCode)로 방 정보를 조회합니다.")
    public ResponseEntity<SuccessResponse<RoomResponseDto>> getRoomByCode(
            @PathVariable String roomCode
    ) {
        Room room = roomService.getRoomByCode(roomCode);
        RoomResponseDto response = RoomResponseDto.from(room);

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @PostMapping("/join")
    @Operation(summary = "게스트 방 입장", description = "초대 코드로 게스트가 방에 입장합니다.")
    public ResponseEntity<SuccessResponse<RoomMemberDto>> joinRoom(
            @Valid @RequestBody RoomMemberJoinRequestDto request
    ) {
        RoomMember member = roomMemberService.joinRoomAsGuest(request.roomCode());

        RoomMemberDto response = RoomMemberDto.from(member, request.nickname());

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @GetMapping("/{roomId}/members")
    @Operation(summary = "방 참여자 목록 조회", description = "특정 방의 모든 ACTIVE 상태 참여자 목록을 조회합니다.")
    public ResponseEntity<SuccessResponse<List<RoomMemberDto>>> getRoomMembers(
            @PathVariable Long roomId
    ) {
        List<RoomMember> members = roomMemberService.getRoomMembers(roomId);

        List<RoomMemberDto> response = members.stream()
                .map(member -> RoomMemberDto.from(member, "User" + member.getMemberId()))
                .toList();

        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @DeleteMapping("/{roomId}/members/{memberId}")
    @Operation(summary = "방 나가기", description = "참여자가 방에서 나갑니다.")
    public ResponseEntity<SuccessResponse<Void>> leaveRoom(
            @PathVariable Long roomId,
            @PathVariable Long memberId
    ) {
        roomMemberService.leaveRoom(memberId);
        return ResponseEntity.ok(SuccessResponse.ok("방에서 나갔습니다."));
    }
}
