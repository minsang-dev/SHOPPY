package ssafy.rtc.shoppy.shopping.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@RestController
@RequestMapping("/rooms/{roomId}/shopping-items")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    @PostMapping
    public ResponseEntity<Void> addShoppingItem(
            @PathVariable Long roomId,
            @RequestBody ShoppingItemAddRequestDto requestDto
    ) {
        // PathVariable로 받은 roomId를 DTO에 주입 (또는 서비스에 별도 전달)
        // 여기서는 DTO의 roomId가 null일 경우를 대비해 덮어씌우거나,
        // 서비스 계층에서 처리하도록 할 수 있습니다.
        // 현재 DTO 구조상 setter가 없으므로, 서비스 메서드 호출 시 roomId를 같이 넘기거나
        // DTO 생성 시점에 처리해야 합니다.
        // 하지만 가장 깔끔한 방법은 DTO에 roomId 필드가 있으므로,
        // 클라이언트가 body에도 roomId를 보내는지, 아니면 pathVariable만 사용하는지에 따라 다릅니다.
        
        // RESTful 설계상 PathVariable의 roomId가 우선시되어야 하므로,
        // 서비스에 roomId를 명시적으로 전달하는 방식으로 변경하겠습니다.
        
        shoppingService.addShoppingItem(roomId, requestDto);
        return ResponseEntity.ok().build();
    }
}
