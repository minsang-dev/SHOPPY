package ssafy.rtc.shoppy.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.product.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 1. 전체 조회는 findAll()이 기본 제공되므로 작성 불필요

    // 2. 키워드 검색 (SQL: SELECT * FROM product WHERE name LIKE %keyword%)
    List<Product> findByNameContaining(String keyword);
}