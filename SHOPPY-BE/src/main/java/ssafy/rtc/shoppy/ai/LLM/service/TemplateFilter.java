package ssafy.rtc.shoppy.ai.llm.service;

import ssafy.rtc.shoppy.ai.llm.entity.RecommendationTemplateEntity;

import java.util.List;

public final class TemplateFilter {

    private TemplateFilter() {
    }

    public static List<RecommendationTemplateEntity> excludeByTraits(
            List<RecommendationTemplateEntity> candidates,
            List<String> selectedTraits
    ) {
        if (selectedTraits == null || selectedTraits.isEmpty()) {
            return candidates;
        }
        return candidates.stream()
                .filter(candidate -> candidate.getTraitExcludes() == null
                        || candidate.getTraitExcludes().stream().noneMatch(selectedTraits::contains))
                .toList();
    }
}
