package ssafy.rtc.shoppy.shopping.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemRequestDto;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
@Tag(name = "Shopping API", description = "쇼핑 아이템(장바구니) 관리 API")
public class ShoppingController {

    private final ShoppingService shoppingService;

    @PostMapping("/items")
    @Operation(summary = "쇼핑 아이템 추가", description = "특정 방의 장바구니에 상품을 추가합니다.")
    public ResponseEntity<SuccessResponse<String>> addShoppingItem(
            @RequestBody ShoppingItemRequestDto requestDto
    ) {
        // TODO: 추후 Spring Security 적용 시 @AuthenticationPrincipal로 변경
        Long mockUserId = 1L; // 임시 유저 ID

        shoppingService.addShoppingItem(requestDto, mockUserId);

        return ResponseEntity.ok(SuccessResponse.of("장바구니에 상품이 추가되었습니다."));
    }
}