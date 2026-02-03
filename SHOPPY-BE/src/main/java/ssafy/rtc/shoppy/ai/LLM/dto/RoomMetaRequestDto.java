package ssafy.rtc.shoppy.ai.llm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record RoomMetaRequestDto(
        @NotBlank
        String roomName,

        @NotBlank
        String purpose,

        @NotNull
        @Min(1)
        Integer headcount,

        @NotEmpty
        List<String> interestCategories,

        @NotNull
        List<String> traits,

        @NotNull
        @PositiveOrZero
        BigDecimal targetBudget,

        @NotNull
        @PositiveOrZero
        BigDecimal minBudget
) {
}
