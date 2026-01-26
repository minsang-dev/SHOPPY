package ssafy.rtc.shoppy.ai.llm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ssafy.rtc.shoppy.ai.llm.entity.RecommendationTemplateEntity;

import java.util.List;

public interface RecommendationTemplateRepository extends JpaRepository<RecommendationTemplateEntity, Long> {

    @Query("""
            select t from RecommendationTemplateEntity t
            where t.isActive = true
              and (t.purposeCode is null or t.purposeCode = :purpose)
              and t.categoryCode in :categories
            order by t.priority asc
            """)
    List<RecommendationTemplateEntity> findActiveCandidates(
            @Param("purpose") String purpose,
            @Param("categories") List<String> categories
    );
}
