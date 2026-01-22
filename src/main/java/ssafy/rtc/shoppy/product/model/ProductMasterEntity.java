package ssafy.rtc.shoppy.product.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_master")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductMasterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String productAlias;

    @Column(nullable = false)
    private String normalizedAlias;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    private String category;
}
