package ssafy.rtc.shoppy.ai.llm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Component
public class ReferenceRuleEngine {

    private final ObjectMapper objectMapper;

    private final Map<String, String> purposeRulePath = Map.of(
            "MT", "ai/reference/purpose-mt.json"
    );

    private final Map<String, String> traitRulePath = Map.of(
            "NO_COOKING", "ai/reference/trait-no-cooking.json"
    );

    public ReferenceRuleEngine(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public PurposeRule loadPurposeRule(String purpose) {
        String path = purposeRulePath.get(purpose);
        if (path == null) {
            throw new IllegalArgumentException("Unsupported purpose: " + purpose);
        }
        return read(path, PurposeRule.class);
    }

    public List<TraitRule> loadTraitRules(List<String> traits) {
        if (traits == null || traits.isEmpty()) {
            return List.of();
        }
        List<TraitRule> rules = new ArrayList<>();
        for (String trait : traits) {
            String path = traitRulePath.get(trait);
            if (path == null) {
                continue;
            }
            rules.add(read(path, TraitRule.class));
        }
        return rules;
    }

    public ComposedRule compose(PurposeRule purposeRule, List<TraitRule> traitRules, List<String> traits) {
        Map<String, CategoryRule> categoryRules = new LinkedHashMap<>(purposeRule.categoryRules());

        Set<String> banKeywords = new LinkedHashSet<>();
        Set<String> allowKeywords = new LinkedHashSet<>();
        Map<String, List<String>> preferKeywordsByCategory = new HashMap<>();

        if (traitRules != null) {
            for (TraitRule tr : traitRules) {
                if (tr == null) {
                    continue;
                }
                HardConstraints hc = tr.hardConstraints();
                if (hc != null) {
                    if (hc.banKeywords() != null) {
                        banKeywords.addAll(hc.banKeywords());
                    }
                    if (hc.allowKeywords() != null) {
                        allowKeywords.addAll(hc.allowKeywords());
                    }
                }
                if (tr.categoryAdjustments() != null) {
                    tr.categoryAdjustments().forEach((category, adj) -> {
                        if (adj != null && adj.preferKeywords() != null) {
                            preferKeywordsByCategory
                                    .computeIfAbsent(category, key -> new ArrayList<>())
                                    .addAll(adj.preferKeywords());
                        }
                    });
                }
            }
        }

        Map<String, List<String>> disableByTrait = purposeRule.disableByTrait();
        if (traits != null && disableByTrait != null) {
            for (String trait : traits) {
                List<String> disabled = disableByTrait.get(trait);
                if (disabled == null || disabled.isEmpty()) {
                    continue;
                }
                for (String category : disabled) {
                    categoryRules.remove(category);
                }
            }
        }

        return new ComposedRule(
            categoryRules,
            banKeywords,
            allowKeywords,
            preferKeywordsByCategory,
            purposeRule.traitMultipliers()
        );
    }

    public Map<String, QuantityInfo> calculateTotals(ComposedRule rule, List<String> traits, int people) {
        if (rule == null || rule.categoryRules() == null) {
            return Map.of();
        }

        Map<String, QuantityInfo> result = new LinkedHashMap<>();

        for (Map.Entry<String, CategoryRule> entry : rule.categoryRules().entrySet()) {
            String category = entry.getKey();
            CategoryRule categoryRule = entry.getValue();

            if (Boolean.TRUE.equals(categoryRule.fixed())) {
                Map<String, Integer> fixedItems = categoryRule.fixedItems() == null
                        ? Map.of()
                        : categoryRule.fixedItems();
                result.put(category, QuantityInfo.fixed(
                        categoryRule.unit(),
                        fixedItems,
                        categoryRule.itemMin(),
                        categoryRule.itemMax()
                ));
                continue;
            }

            double perPerson = midpoint(categoryRule.perPersonMin(), categoryRule.perPersonMax());
            double multiplier = resolveGlobalMultiplier(traits, rule.traitMultipliers());
            multiplier *= resolveCategoryMultiplier(traits, rule.traitMultipliers(), category);

            double total = perPerson * people * multiplier;

            result.put(category, QuantityInfo.total(
                    categoryRule.unit(),
                    total,
                    categoryRule.itemMin(),
                    categoryRule.itemMax()
            ));
        }

        return result;
    }

    private double midpoint(Double min, Double max) {
        if (min == null && max == null) {
            return 0.0;
        }
        if (min == null) {
            return max;
        }
        if (max == null) {
            return min;
        }
        return (min + max) / 2.0;
    }

    private double resolveGlobalMultiplier(List<String> traits, Map<String, Object> multipliers) {
        if (traits == null || traits.isEmpty() || multipliers == null) {
            return 1.0;
        }
        double multiplier = 1.0;
        for (String trait : traits) {
            Object value = multipliers.get(trait);
            if (value instanceof Number number) {
                multiplier *= number.doubleValue();
            }
        }
        return multiplier;
    }

    @SuppressWarnings("unchecked")
    private double resolveCategoryMultiplier(List<String> traits, Map<String, Object> multipliers, String category) {
        if (traits == null || traits.isEmpty() || multipliers == null) {
            return 1.0;
        }
        double multiplier = 1.0;
        for (String trait : traits) {
            Object value = multipliers.get(trait);
            if (value instanceof Map<?, ?> map) {
                Object categoryMultiplier = ((Map<String, Object>) map).get(category);
                if (categoryMultiplier instanceof Number number) {
                    multiplier *= number.doubleValue();
                }
            }
        }
        return multiplier;
    }

    private <T> T read(String path, Class<T> type) {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readValue(is, type);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to read rule file: " + path, ex);
        }
    }

    public record CategoryRule(
            String unit,
            Double perPersonMin,
            Double perPersonMax,
            Boolean fixed,
            Map<String, Integer> fixedItems,
            Integer itemMin,
            Integer itemMax
    ) {
        public CategoryRule withItemRange(Integer itemMin, Integer itemMax) {
            return new CategoryRule(unit, perPersonMin, perPersonMax, fixed, fixedItems, itemMin, itemMax);
        }
    }

    public record PurposeRule(
            String id,
            String type,
            String purpose,
            Map<String, CategoryRule> categoryRules,
            Map<String, Object> traitMultipliers,
            Map<String, List<String>> disableByTrait
    ) {
    }

    public record TraitRule(
            String id,
            String type,
            String trait,
            HardConstraints hardConstraints,
            Map<String, CategoryAdjustment> categoryAdjustments
    ) {
    }

    public record HardConstraints(
            List<String> banKeywords,
            List<String> allowKeywords
    ) {
    }

    public record CategoryAdjustment(
            List<String> preferKeywords
    ) {
    }

    public record ComposedRule(
            Map<String, CategoryRule> categoryRules,
            Set<String> banKeywords,
            Set<String> allowKeywords,
            Map<String, List<String>> preferKeywordsByCategory,
            Map<String, Object> traitMultipliers
    ) {
    }

    public record QuantityInfo(
            String unit,
            Double total,
            Map<String, Integer> fixedItems,
            Integer itemMin,
            Integer itemMax
    ) {
        public static QuantityInfo total(String unit, double total, Integer itemMin, Integer itemMax) {
            return new QuantityInfo(unit, total, null, itemMin, itemMax);
        }

        public static QuantityInfo fixed(String unit,
                                         Map<String, Integer> fixedItems,
                                         Integer itemMin,
                                         Integer itemMax) {
            return new QuantityInfo(unit, null, fixedItems, itemMin, itemMax);
        }
    }
}
