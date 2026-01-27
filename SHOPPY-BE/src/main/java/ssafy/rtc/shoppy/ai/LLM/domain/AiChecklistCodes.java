package ssafy.rtc.shoppy.ai.llm.domain;

import java.util.List;
import java.util.Map;
import java.util.Set;

public final class AiChecklistCodes {

    public static final Set<String> PURPOSE_CODES = Set.of(
            "TRAVEL",
            "MT",
            "PARTY",
            "CAMPING",
            "DAILY",
            "GIFT"
    );

    public static final Set<String> INTEREST_CATEGORY_CODES = Set.of(
            "FOOD",
            "MEAT",
            "VEGETABLE",
            "FRESH",
            "DRINK",
            "ALCOHOL",
            "SNACK",
            "COOKING",
            "SUPPLY"
    );

    public static final Set<String> TRAIT_CODES = Set.of(
            "VALUE",
            "PREMIUM",
            "BULK",
            "MINIMAL",
            "ALCOHOL_YES",
            "ALCOHOL_NO",
            "EASY_COOK",
            "MEAT_LOVER",
            "VEGGIE",
            "OUTDOOR",
            "INDOOR",
            "COOKING_AVAILABLE",
            "NO_COOKING"
    );

    public static final List<TraitPair> MUTEX_TRAITS = List.of(
            new TraitPair("VALUE", "PREMIUM"),
            new TraitPair("BULK", "MINIMAL"),
            new TraitPair("ALCOHOL_YES", "ALCOHOL_NO"),
            new TraitPair("OUTDOOR", "INDOOR"),
            new TraitPair("COOKING_AVAILABLE", "NO_COOKING")
    );

    public static final Map<String, String> CHECKLIST_CATEGORY_LABELS = Map.of(
            "MEAT_PROTEIN", "Meat/Protein",
            "VEGETABLE", "Vegetables",
            "FRESH", "Fresh",
            "DRINK", "Drinks",
            "ALCOHOL", "Alcohol",
            "SNACK", "Snacks",
            "COOKING", "Cooking",
            "SUPPLY", "Supply"
    );

    public static final List<String> CHECKLIST_CATEGORY_ORDER = List.of(
            "MEAT_PROTEIN",
            "VEGETABLE",
            "FRESH",
            "DRINK",
            "ALCOHOL",
            "SNACK",
            "COOKING",
            "SUPPLY"
    );

    private AiChecklistCodes() {
    }

    public static String labelForCategory(String code) {
        return CHECKLIST_CATEGORY_LABELS.getOrDefault(code, code);
    }

    public record TraitPair(String left, String right) {
    }
}
