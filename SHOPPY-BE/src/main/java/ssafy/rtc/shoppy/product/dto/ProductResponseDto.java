package ssafy.rtc.shoppy.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.product.entity.Product;

import java.math.BigDecimal;

@Schema(description = "상품 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    @Schema(description = "상품 ID", example = "1")
    private Long productId;

    @Schema(description = "상품명", example = "서울우유 1L")
    private String name;

    @Schema(description = "가격", example = "3500")
    private BigDecimal price;

    @Schema(description = "상품 이미지 URL", example = "https://example.com/milk.jpg")
    private String imageUrl;

    public static ProductResponseDto from(Product product) {
        return ProductResponseDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .build();
    }
}
