package ssafy.rtc.shoppy.shopping.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ssafy.rtc.shoppy.shopping.dto.ShoppingItemAddRequestDto;
import ssafy.rtc.shoppy.shopping.service.ShoppingService;

@RestController
@RequestMapping("/shopping")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    @PostMapping("/add")
    public ResponseEntity<Void> addShoppingItem(@RequestBody ShoppingItemAddRequestDto requestDto) {
        shoppingService.addShoppingItem(requestDto);
        return ResponseEntity.ok().build();
    }
}
