package ssafy.rtc.shoppy.ai.llm.service;

import ssafy.rtc.shoppy.ai.llm.entity.RecommendationTemplateEntity;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public final class TemplateFilter {

    private static final Set<String> EXCLUSION_TRAITS = Set.of(
            "VEGGIE",
            "ALCOHOL_NO",
            "NO_COOKING"
    );

    private static final Set<String> TAG_TRAITS = Set.of(
            "CONSUMABLE",
            "EQUIPMENT",
            "TOOL"
    );

    private static final int SCORE_CONSUMABLE = 30;
    private static final int SCORE_TOOL = 10;
    private static final int SCORE_EQUIPMENT = -15;
    private static final int NO_COOKING_PENALTY = -1000;

    private static final Set<String> DEFAULT_TOOL_TRAIT = Set.of("TOOL");

    private static final Map<String, TraitScore> ITEM_TRAIT_MAP = buildItemTraitMap();

    private TemplateFilter() {
    }

    public static List<RecommendationTemplateEntity> excludeByTraits(
            List<RecommendationTemplateEntity> candidates,
            List<String> selectedTraits
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }
        if (selectedTraits == null || selectedTraits.isEmpty()) {
            return candidates;
        }

        Set<String> selectedExclusions = selectedTraits.stream()
                .filter(EXCLUSION_TRAITS::contains)
                .collect(Collectors.toSet());

        if (selectedExclusions.isEmpty()) {
            return candidates;
        }

        return candidates.stream()
                .filter(candidate -> {
                    List<String> excludes = candidate.getBanTraits();
                    if (excludes == null || excludes.isEmpty()) {
                        return true;
                    }

                    return excludes.stream()
                            .filter(EXCLUSION_TRAITS::contains)
                            .noneMatch(selectedExclusions::contains);
                })
                .toList();
    }

    public static List<RecommendationTemplateEntity> sortByTraitScore(
            List<RecommendationTemplateEntity> candidates,
            List<String> selectedTraits
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        boolean noCooking = selectedTraits != null && selectedTraits.contains("NO_COOKING");

        return candidates.stream()
                .sorted((left, right) -> Integer.compare(
                        score(right, noCooking),
                        score(left, noCooking)
                ))
                .toList();
    }

    public static int scoreForDebug(RecommendationTemplateEntity template, List<String> traitCodes) {
        boolean noCooking = traitCodes != null && traitCodes.contains("NO_COOKING");
        return score(template, noCooking);
    }

    private static int score(RecommendationTemplateEntity candidate, boolean noCooking) {
        int score = candidate.getPriority();

        TraitScore fallback = ITEM_TRAIT_MAP.get(candidate.getItemName());
        if (fallback != null && fallback.priorityOverride > 0) {
            score = fallback.priorityOverride;
        }

        Set<String> tags = extractTagTraits(candidate.getTemplateTags());
        if (tags.isEmpty() && fallback != null) {
            tags = fallback.traits;
        }
        if (tags.isEmpty()) {
            TraitScore defaultTrait = defaultTraitForCategory(candidate.getCategoryCode());
            if (defaultTrait != null) {
                tags = defaultTrait.traits;
            }
        }

        if (tags.contains("CONSUMABLE")) {
            score += SCORE_CONSUMABLE;
        }
        if (tags.contains("TOOL")) {
            score += SCORE_TOOL;
        }
        if (tags.contains("EQUIPMENT")) {
            score += SCORE_EQUIPMENT;
        }

        if (noCooking && (tags.contains("EQUIPMENT") || tags.contains("TOOL"))) {
            score += NO_COOKING_PENALTY;
        }

        return score;
    }

    private static Set<String> extractTagTraits(List<String> templateTags) {
        if (templateTags != null && !templateTags.isEmpty()) {
            Set<String> tags = new HashSet<>();
            for (String t : templateTags) {
                if (TAG_TRAITS.contains(t)) {
                    tags.add(t);
                }
            }
            if (!tags.isEmpty()) {
                return tags;
            }
        }
        return Set.of();
    }

    private static TraitScore defaultTraitForCategory(String categoryCode) {
        if ("COOKING".equals(categoryCode) || "COOKING_TOOL".equals(categoryCode) || "SUPPLY".equals(categoryCode)) {
            return new TraitScore(DEFAULT_TOOL_TRAIT, 0);
        }
        return null;
    }

    private static Map<String, TraitScore> buildItemTraitMap() {
        Map<String, TraitScore> map = new HashMap<>();

        // COOKING: EQUIPMENT
        put(map, "부루스타 가스", "EQUIPMENT", 45);
        put(map, "부탄가스", "EQUIPMENT", 45);
        put(map, "휴대용 가스버너", "EQUIPMENT", 42);
        put(map, "불판", "EQUIPMENT", 38);
        put(map, "코팅팬", "EQUIPMENT", 36);
        put(map, "냄비", "EQUIPMENT", 34);

        // COOKING: TOOL
        put(map, "집게", "TOOL", 62);
        put(map, "뒤집개", "TOOL", 60);
        put(map, "국자", "TOOL", 58);
        put(map, "가위", "TOOL", 56);
        put(map, "칼", "TOOL", 52);
        put(map, "도마", "TOOL", 50);

        // COOKING: CONSUMABLE
        put(map, "호일", "CONSUMABLE", 88);
        put(map, "랩", "CONSUMABLE", 86);
        put(map, "종이컵", "CONSUMABLE", 95);
        put(map, "일회용 접시", "CONSUMABLE", 93);
        put(map, "일회용접시", "CONSUMABLE", 93);
        put(map, "일회용 수저", "CONSUMABLE", 92);
        put(map, "일회용수저", "CONSUMABLE", 92);
        put(map, "일회용 젓가락", "CONSUMABLE", 91);
        put(map, "일회용젓가락", "CONSUMABLE", 91);
        put(map, "키친타월", "CONSUMABLE", 90);

        // SUPPLY: CONSUMABLE
        put(map, "쓰레기봉투", "CONSUMABLE", 95);
        put(map, "종량제 봉투", "CONSUMABLE", 94);
        put(map, "물티슈", "CONSUMABLE", 92);
        put(map, "휴지", "CONSUMABLE", 91);
        put(map, "알코올 티슈", "CONSUMABLE", 89);
        put(map, "알코올티슈", "CONSUMABLE", 89);
        put(map, "손세정제", "CONSUMABLE", 88);
        put(map, "비닐봉투", "CONSUMABLE", 87);
        put(map, "지퍼백", "CONSUMABLE", 86);
        put(map, "일회용 장갑", "CONSUMABLE", 82);
        put(map, "위생장갑", "CONSUMABLE", 82);
        put(map, "행주", "CONSUMABLE", 70);
        put(map, "수세미", "CONSUMABLE", 68);

        // SUPPLY: TOOL
        put(map, "고무장갑", "TOOL", 60);
        put(map, "구급상자", "TOOL", 66);
        put(map, "구급밴드", "TOOL", 65);
        put(map, "모기기피제", "TOOL", 64);
        put(map, "모기향", "TOOL", 55);
        put(map, "라이터", "TOOL", 50);

        // SUPPLY: EQUIPMENT
        put(map, "멀티탭", "EQUIPMENT", 58);
        put(map, "연장선", "EQUIPMENT", 52);
        put(map, "랜턴/후레쉬", "EQUIPMENT", 57);

        return map;
    }

    private static void put(Map<String, TraitScore> map, String name, String trait, int priority) {
        map.put(name, new TraitScore(Set.of(trait), priority));
    }

    private record TraitScore(Set<String> traits, int priorityOverride) {
    }
}
