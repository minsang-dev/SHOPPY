package ssafy.rtc.shoppy.settlement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.settlement.dto.ReceiptUploadResponse;
import ssafy.rtc.shoppy.settlement.dto.SettlementCreateRequest;
import ssafy.rtc.shoppy.settlement.dto.SplitUpdateRequest;
import ssafy.rtc.shoppy.settlement.entity.Purchase;
import ssafy.rtc.shoppy.settlement.service.SettlementService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Settlement", description = "정산 API")
public class SettlementController {

    private final SettlementService settlementService;
    private final RoomMemberRepository roomMemberRepository;

    @Operation(summary = "영수증 이미지 업로드 (정산 시작)")
    @PostMapping(value = "/rooms/{roomId}/settlements/receipt", consumes = "multipart/form-data")
    public ResponseEntity<SuccessResponse<ReceiptUploadResponse>> uploadReceipt(
            @PathVariable Long roomId,
            @RequestPart("file") MultipartFile file) {
        
        // SecurityContextHolder에서 userId 추출 필요
        Long currentUserId = 1L; 

        // 현재 방의 멤버인지 확인
        RoomMemberEntity roomMember = roomMemberRepository.findByRoom_RoomIdAndUserIdAndStatus(roomId, currentUserId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("해당 방의 참여자가 아닙니다."));

        ReceiptUploadResponse response = settlementService.uploadReceipt(roomId, roomMember.getMemberId(), file);
        
        return ResponseEntity.ok(SuccessResponse.of(response));
    }

    @Operation(summary = "정산 마스터 생성")
    @PostMapping("/rooms/{roomId}/settlements")
    public ResponseEntity<SuccessResponse<Purchase>> createSettlement(
            @PathVariable Long roomId,
            @RequestBody SettlementCreateRequest request) {
        
        // TODO: 추후 Spring Security의 @AuthenticationPrincipal로 변경 필요
        Long currentUserId = 1L; // 임시 하드코딩 (RoomController와 동일 패턴)

        Purchase purchase = settlementService.createSettlement(
                roomId,
                request.getPayerMemberId(),
                request.getTotalAmount(),
                request.getItems(),
                currentUserId
        );
        return ResponseEntity.ok(SuccessResponse.of(purchase));
    }

    @Operation(summary = "오프라인 영수증 등록 연결 (Stub)")
    @PostMapping("/settlements/{settlementId}/receipts")
    public ResponseEntity<SuccessResponse<String>> connectReceipt(@PathVariable Long settlementId) {
        // 실제 구현은 영수증 OCR 연동 등이 필요하지만 여기서는 연결 성공 메시지만 반환
        return ResponseEntity.ok(SuccessResponse.of("Receipt connected to settlement " + settlementId));
    }

    @Operation(summary = "특정 품목 참여자 변경 및 재정산")
    @PutMapping("/settlement-items/{itemId}/splits")
    public ResponseEntity<SuccessResponse<Void>> updateSplit(
            @PathVariable Long itemId,
            @RequestBody SplitUpdateRequest request) {
        settlementService.updateAllocations(itemId, request.getMemberIds());
        return ResponseEntity.ok(SuccessResponse.ok());
    }

    @Operation(summary = "전체 정산 상세 조회")
    @GetMapping("/settlements/{settlementId}")
    public ResponseEntity<SuccessResponse<Purchase>> getSettlement(@PathVariable Long settlementId) {
        Purchase purchase = settlementService.getSettlement(settlementId);
        return ResponseEntity.ok(SuccessResponse.of(purchase));
    }

    @Operation(summary = "정산 완료 및 리포트 생성")
    @PostMapping("/settlements/{settlementId}/complete")
    public ResponseEntity<SuccessResponse<String>> completeSettlement(@PathVariable Long settlementId) {
        String report = settlementService.completeAndGetReport(settlementId);
        return ResponseEntity.ok(SuccessResponse.of(report));
    }
}