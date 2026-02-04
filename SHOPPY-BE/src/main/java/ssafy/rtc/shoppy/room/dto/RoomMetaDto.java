package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record RoomMetaDto(
        @NotBlank String shoppingPurpose,

        @NotEmpty List<String> interestCategories,

        @NotNull @Min(1) Integer headcount,

        @NotNull @Positive BigDecimal budgetMin,

        BigDecimal budgetMax) {
    public static RoomMetaDto copyWithBudgetMax(RoomMetaDto meta, BigDecimal budgetMax) {
        if (meta == null) {
            return null;
        }
        return new RoomMetaDto(
                meta.shoppingPurpose(),
                meta.interestCategories(),
                meta.headcount(),
                meta.budgetMin(),
                budgetMax);
    }
}
