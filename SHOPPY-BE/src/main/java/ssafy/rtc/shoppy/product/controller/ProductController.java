package ssafy.rtc.shoppy.product.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ssafy.rtc.shoppy.global.response.SuccessResponse; // 작성하신 패키지 경로 import
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssafy.rtc.shoppy.product.dto.ProductResponseDto;
import ssafy.rtc.shoppy.product.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Product API", description = "상품 조회 및 검색 API")
public class ProductController {

    private final ProductService productService;

    /**
     * 1. 전체 상품 조회
     * 응답 타입: ResponseEntity<SuccessResponse<List<ProductResponseDto>>>
     */
    @GetMapping
    @Operation(summary = "전체 상품 조회", description = "등록된 모든 gomgom 상품을 조회합니다.")
    public ResponseEntity<SuccessResponse<List<ProductResponseDto>>> getAllProducts() {

        // 1. 서비스에서 데이터 가져오기
        List<ProductResponseDto> data = productService.getAllProducts();

        // 2. SuccessResponse로 감싸고, 다시 ResponseEntity로 감싸서 리턴
        // 사용법: SuccessResponse.of(data)
        return ResponseEntity.ok(SuccessResponse.of(data));
    }

    /**
     * 2. 상품 키워드 검색
     */
    @GetMapping("/search")
    @Operation(summary = "상품 검색", description = "키워드가 포함된 상품 목록을 반환합니다.")
    public ResponseEntity<SuccessResponse<List<ProductResponseDto>>> searchProducts(
            @RequestParam("keyword") String keyword
    ) {
        List<ProductResponseDto> searchResults = productService.searchProducts(keyword);

        // 데이터와 함께 커스텀 메시지를 보내고 싶다면?
        // SuccessResponse.of("검색 성공", searchResults) 처럼 쓸 수도 있습니다.
        return ResponseEntity.ok(SuccessResponse.of(searchResults));
    }
}