package ssafy.rtc.shoppy.shopping.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.global.response.ApiResponse;
import ssafy.rtc.shoppy.shopping.dto.*;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@Tag(name = "Shopping", description = "공동 장바구니 API")
@RestController
@RequestMapping("/rooms/{roomId}/shopping-items")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    @Operation(summary = "장바구니 아이템 추가", description = "방의 공동 장바구니에 새로운 아이템을 추가합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addShoppingItem(
            @Parameter(description = "방 ID") @PathVariable Long roomId,
            @RequestBody ShoppingItemAddRequestDto requestDto
    ) {
        shoppingService.addShoppingItem(roomId, requestDto);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "장바구니 목록 조회", description = "방의 공동 장바구니에 등록된 모든 아이템을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> getShoppingList(
            @Parameter(description = "방 ID") @PathVariable Long roomId
    ) {
        ShoppingListResponseDto responseDto = shoppingService.getShoppingList(roomId);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }

    @Operation(summary = "장바구니 아이템 수정", description = "장바구니 아이템의 수량, 체크 상태, 연결 상품을 수정합니다.")
    @PatchMapping("/{shoppingItemId}")
    public ResponseEntity<ApiResponse<ShoppingItemUpdateResponseDto>> updateShoppingItem(
            @Parameter(description = "방 ID") @PathVariable Long roomId,
            @Parameter(description = "장바구니 아이템 ID") @PathVariable Long shoppingItemId,
            @RequestBody ShoppingItemUpdateRequestDto requestDto
    ) {
        ShoppingItemUpdateResponseDto responseDto = shoppingService.updateShoppingItem(roomId, shoppingItemId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }

    @Operation(summary = "장바구니 아이템 삭제", description = "장바구니에서 아이템을 삭제합니다.")
    @DeleteMapping("/{shoppingItemId}")
    public ResponseEntity<ApiResponse<ShoppingItemDeleteResponseDto>> deleteShoppingItem(
            @Parameter(description = "방 ID") @PathVariable Long roomId,
            @Parameter(description = "장바구니 아이템 ID") @PathVariable Long shoppingItemId
    ) {
        ShoppingItemDeleteResponseDto responseDto = shoppingService.deleteShoppingItem(roomId, shoppingItemId);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }
}
