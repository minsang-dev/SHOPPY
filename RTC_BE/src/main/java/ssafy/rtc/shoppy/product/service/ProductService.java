package ssafy.rtc.shoppy.product.service;

import ssafy.rtc.shoppy.product.dto.ProductResponseDto;

import java.util.List;

public interface ProductService {

    List<ProductResponseDto> getAllProducts();
    List<ProductResponseDto> searchProducts(String keyword);

}
