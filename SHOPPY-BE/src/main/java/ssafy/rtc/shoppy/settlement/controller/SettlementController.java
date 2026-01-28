package ssafy.rtc.shoppy.settlement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.settlement.dto.SettlementItemCreateRequest;
import ssafy.rtc.shoppy.settlement.dto.SettlementItemCreateResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Settlement", description = "정산 API")
public class SettlementController {

    private final SettlementService settlementService;
    private final RoomMemberRepository roomMemberRepository;

    // ... uploadReceipt ...

    @Operation(summary = "정산 품목 수동 추가")
    @PostMapping("/receipts/{receiptId}/items")
    public ResponseEntity<ApiResponse<SettlementItemCreateResponse>> addSettlementItem(
            @PathVariable Long receiptId,
            @RequestBody @Valid SettlementItemCreateRequest request) {
        
        SettlementItemCreateResponse response = settlementService.addSettlementItem(receiptId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "정산 품목 수정 (이름/가격/수량)")
    @PutMapping("/settlement-items/{itemId}")
    public ResponseEntity<ApiResponse<SettlementItemCreateResponse>> updateSettlementItem(
            @PathVariable Long itemId,
            @RequestBody @Valid SettlementItemCreateRequest request) {
        SettlementItemCreateResponse response = settlementService.updateSettlementItem(itemId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "정산 품목 삭제")
    @DeleteMapping("/settlement-items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteSettlementItem(@PathVariable Long itemId) {
        settlementService.deleteSettlementItem(itemId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "오프라인 영수증 등록 연결 (Stub)")
    @PostMapping("/settlements/{settlementId}/receipts")
    public ResponseEntity<String> connectReceipt(@PathVariable Long settlementId) {
        // 실제 구현은 영수증 OCR 연동 등이 필요하지만 여기서는 연결 성공 메시지만 반환
        return ResponseEntity.ok("Receipt connected to settlement " + settlementId);
    }

    @Operation(summary = "특정 품목 참여자 변경 및 재정산")
    @PutMapping("/settlement-items/{itemId}/splits")
    public ResponseEntity<Void> updateSplit(
            @PathVariable Long itemId,
            @RequestBody SplitUpdateRequest request) {
        settlementService.updateAllocations(itemId, request.getMemberIds());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "전체 정산 상세 조회")
    @GetMapping("/settlements/{settlementId}")
    public ResponseEntity<Purchase> getSettlement(@PathVariable Long settlementId) {
        Purchase purchase = settlementService.getSettlement(settlementId);
        return ResponseEntity.ok(purchase);
    }

    @Operation(summary = "정산 완료 및 리포트 생성")
    @PostMapping("/settlements/{settlementId}/complete")
    public ResponseEntity<String> completeSettlement(@PathVariable Long settlementId) {
        String report = settlementService.completeAndGetReport(settlementId);
        return ResponseEntity.ok(report);
    }
}
