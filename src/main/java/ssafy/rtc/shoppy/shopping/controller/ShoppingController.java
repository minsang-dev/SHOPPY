package ssafy.rtc.shoppy.shopping.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.global.response.ApiResponse;
import ssafy.rtc.shoppy.shopping.dto.*;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@RestController
@RequestMapping("/rooms/{roomId}/shopping-items")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addShoppingItem(
            @PathVariable Long roomId,
            @RequestBody ShoppingItemAddRequestDto requestDto
    ) {
        shoppingService.addShoppingItem(roomId, requestDto);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> getShoppingList(
            @PathVariable Long roomId
    ) {
        ShoppingListResponseDto responseDto = shoppingService.getShoppingList(roomId);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }

    @PatchMapping("/{shoppingItemId}")
    public ResponseEntity<ApiResponse<ShoppingItemUpdateResponseDto>> updateShoppingItem(
            @PathVariable Long roomId,
            @PathVariable Long shoppingItemId,
            @RequestBody ShoppingItemUpdateRequestDto requestDto
    ) {
        ShoppingItemUpdateResponseDto responseDto = shoppingService.updateShoppingItem(roomId, shoppingItemId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }

    @DeleteMapping("/{shoppingItemId}")
    public ResponseEntity<ApiResponse<ShoppingItemDeleteResponseDto>> deleteShoppingItem(
            @PathVariable Long roomId,
            @PathVariable Long shoppingItemId
    ) {
        ShoppingItemDeleteResponseDto responseDto = shoppingService.deleteShoppingItem(roomId, shoppingItemId);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }
}
