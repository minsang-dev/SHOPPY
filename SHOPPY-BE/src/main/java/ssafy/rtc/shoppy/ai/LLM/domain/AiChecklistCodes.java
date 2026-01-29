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
            "FOOD_READY",
            "MEAT_RAW",
            "VEGETABLE_RAW",
            "FRESH_READY",
            "DRINK_NON_ALCOHOL",
            "ALCOHOL",
            "SNACK",
            "COOKING_TOOL",
            "SUPPLY"
    );

    public static final Set<String> TRAIT_CODES = Set.of(
            "VALUE",
            "PREMIUM",
            "BULK",
            "MINIMAL",
            "BALANCED",
            "ALCOHOL_YES",
            "ALCOHOL_NO",
            "EASY_COOK",
            "MEAT_LOVER",
            "VEGGIE",
            "OUTDOOR",
            "INDOOR",
            "COOKING_OK",
            "COOKING_AVAILABLE",
            "NO_COOKING",
            "MEAL_MAIN",
            "SNACK_MAIN",
            "VARIETY_OK",
            "CONSUMABLE",
            "EQUIPMENT",
            "TOOL"
    );

    public static final List<TraitPair> MUTEX_TRAITS = List.of(
            new TraitPair("VALUE", "PREMIUM"),
            new TraitPair("BULK", "MINIMAL"),
            new TraitPair("ALCOHOL_YES", "ALCOHOL_NO"),
            new TraitPair("OUTDOOR", "INDOOR"),
            new TraitPair("COOKING_OK", "NO_COOKING"),
            new TraitPair("COOKING_AVAILABLE", "NO_COOKING")
    );

    public static final Map<String, String> CHECKLIST_CATEGORY_LABELS = Map.of(
            "FOOD_READY", "Ready Meals",
            "MEAT_RAW", "Raw Meat",
            "VEGETABLE_RAW", "Raw Vegetables",
            "FRESH_READY", "Fresh Ready",
            "DRINK_NON_ALCOHOL", "Drinks",
            "ALCOHOL", "Alcohol",
            "SNACK", "Snacks",
            "COOKING_TOOL", "Cooking Tools",
            "SUPPLY", "Supply"
    );

    public static final List<String> CHECKLIST_CATEGORY_ORDER = List.of(
            "FOOD_READY",
            "MEAT_RAW",
            "VEGETABLE_RAW",
            "FRESH_READY",
            "DRINK_NON_ALCOHOL",
            "ALCOHOL",
            "SNACK",
            "COOKING_TOOL",
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
