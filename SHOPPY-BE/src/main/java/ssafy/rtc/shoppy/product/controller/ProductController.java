package ssafy.rtc.shoppy.product.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import ssafy.rtc.shoppy.global.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
     * - page, size 파라미터가 없으면 전체 조회
     * - page, size 파라미터가 있으면 페이징 조회
     */
    @GetMapping
    @Operation(summary = "전체 상품 조회", description = "등록된 모든 gomgom 상품을 조회합니다. page/size 파라미터로 페이징 가능합니다.")
    public ResponseEntity<SuccessResponse<?>> getAllProducts(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(required = false) Integer page,
            @Parameter(description = "페이지 크기") @RequestParam(required = false) Integer size
    ) {
        if (page != null && size != null) {
            Page<ProductResponseDto> data = productService.getAllProducts(PageRequest.of(page, size));
            return ResponseEntity.ok(SuccessResponse.of(data));
        }

        List<ProductResponseDto> data = productService.getAllProducts();
        return ResponseEntity.ok(SuccessResponse.of(data));
    }

    /**
     * 2. 상품 키워드 검색
     * - page, size 파라미터가 없으면 전체 검색
     * - page, size 파라미터가 있으면 페이징 검색
     */
    @GetMapping("/search")
    @Operation(summary = "상품 검색", description = "키워드가 포함된 상품 목록을 반환합니다. page/size 파라미터로 페이징 가능합니다.")
    public ResponseEntity<SuccessResponse<?>> searchProducts(
            @RequestParam("keyword") String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(required = false) Integer page,
            @Parameter(description = "페이지 크기") @RequestParam(required = false) Integer size
    ) {
        if (page != null && size != null) {
            Page<ProductResponseDto> searchResults = productService.searchProducts(keyword, PageRequest.of(page, size));
            return ResponseEntity.ok(SuccessResponse.of(searchResults));
        }

        List<ProductResponseDto> searchResults = productService.searchProducts(keyword);
        return ResponseEntity.ok(SuccessResponse.of(searchResults));
    }
}