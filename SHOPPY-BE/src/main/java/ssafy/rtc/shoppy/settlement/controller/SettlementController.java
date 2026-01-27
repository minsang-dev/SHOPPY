package ssafy.rtc.shoppy.settlement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @Operation(summary = "정산 마스터 생성")
    @PostMapping("/rooms/{roomId}/settlements")
    public ResponseEntity<Purchase> createSettlement(
            @PathVariable Long roomId,
            @RequestBody SettlementCreateRequest request) {
        Purchase purchase = settlementService.createSettlement(
                roomId,
                request.getPayerMemberId(),
                request.getTotalAmount(),
                request.getItems()
        );
        return ResponseEntity.ok(purchase);
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
