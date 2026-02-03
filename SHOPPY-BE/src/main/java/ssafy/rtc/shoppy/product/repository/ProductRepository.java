package ssafy.rtc.shoppy.product.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.product.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 1. 전체 조회는 findAll()이 기본 제공되므로 작성 불필요
    // 페이징: findAll(Pageable)도 기본 제공

    // 2. 키워드 검색 (SQL: SELECT * FROM product WHERE name LIKE %keyword%)
    List<Product> findByNameContaining(String keyword);

    // 페이징 키워드 검색
    Page<Product> findByNameContaining(String keyword, Pageable pageable);
}