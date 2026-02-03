package ssafy.rtc.shoppy.product.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ssafy.rtc.shoppy.product.dto.ProductResponseDto;

import java.util.List;

public interface ProductService {

    List<ProductResponseDto> getAllProducts();
    Page<ProductResponseDto> getAllProducts(Pageable pageable);

    List<ProductResponseDto> searchProducts(String keyword);
    Page<ProductResponseDto> searchProducts(String keyword, Pageable pageable);

}
