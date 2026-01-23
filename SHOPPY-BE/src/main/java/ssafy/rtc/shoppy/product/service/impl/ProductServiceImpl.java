package ssafy.rtc.shoppy.product.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.product.dto.ProductResponseDto;
import ssafy.rtc.shoppy.product.entity.Product;
import ssafy.rtc.shoppy.product.repository.ProductRepository;
import ssafy.rtc.shoppy.product.service.ProductService;

import java.util.List;
import java.util.stream.Collectors;

@Service // 스프링 빈 등록은 구현체에!
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductResponseDto> getAllProducts() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(ProductResponseDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDto> searchProducts(String keyword) {
        // 키워드 유효성 검사 (빈 문자열이면 빈 리스트 반환)
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        // Repository에서 Containing 메서드로 검색
        List<Product> products = productRepository.findByNameContaining(keyword);

        return products.stream()
                .map(ProductResponseDto::from)
                .collect(Collectors.toList());
    }
}