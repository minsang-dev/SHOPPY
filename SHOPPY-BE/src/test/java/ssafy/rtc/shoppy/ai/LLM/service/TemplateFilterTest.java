package ssafy.rtc.shoppy.ai.LLM.service;

import org.junit.jupiter.api.Test;
import ssafy.rtc.shoppy.ai.llm.entity.RecommendationTemplateEntity;
import ssafy.rtc.shoppy.ai.llm.service.TemplateFilter;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TemplateFilterTest {

    @Test
    void excludeByTraitsRemovesConflicts() {
        RecommendationTemplateEntity keep = RecommendationTemplateEntity.create(
                "DRINK",
                "Water",
                List.of(),
                1
        );
        RecommendationTemplateEntity remove = RecommendationTemplateEntity.create(
                "ALCOHOL",
                "Beer",
                List.of("ALCOHOL_NO"),
                1
        );

        List<RecommendationTemplateEntity> filtered = TemplateFilter.excludeByTraits(
                List.of(keep, remove),
                List.of("ALCOHOL_NO")
        );

        assertEquals(1, filtered.size());
        assertEquals("Water", filtered.get(0).getItemName());
    }
}
