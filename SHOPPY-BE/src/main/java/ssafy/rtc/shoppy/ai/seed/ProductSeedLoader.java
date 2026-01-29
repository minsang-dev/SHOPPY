package ssafy.rtc.shoppy.ai.seed;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;

@Profile("local")
@Component
public class ProductSeedLoader implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductSeedLoader.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Value("classpath:seed/productList.json")
    private Resource productSeed;

    public ProductSeedLoader(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        List<ProductRow> rows;
        try (InputStream is = productSeed.getInputStream()) {
            rows = objectMapper.readValue(is, new TypeReference<List<ProductRow>>() {
            });
        }

        if (rows == null || rows.isEmpty()) {
            log.info("[Seed] productList.json empty -> skip");
            return;
        }

        String sql = """
                INSERT INTO product (product_id, name, price, image_url)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    price = VALUES(price),
                    image_url = VALUES(image_url)
                """;

        jdbcTemplate.batchUpdate(sql, rows, 500, (ps, r) -> {
            ps.setLong(1, r.product_id());
            ps.setString(2, r.name());
            ps.setBigDecimal(3, r.price());
            ps.setString(4, r.image_url());
        });

        log.info("[Seed] product upserted: {}", rows.size());
    }

    public record ProductRow(long product_id, String name, BigDecimal price, String image_url) {
    }
}
