package ssafy.rtc.shoppy.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ssafy.rtc.shoppy.product.model.ProductMasterEntity;

import java.util.List;

public interface ProductMasterRepository extends JpaRepository<ProductMasterEntity, Integer> {

    @Query("SELECT p FROM ProductMasterEntity p WHERE LOWER(p.normalizedAlias) LIKE %:token% OR LOWER(p.keywords) LIKE %:token%")
    List<ProductMasterEntity> searchByToken(@Param("token") String token);
}
