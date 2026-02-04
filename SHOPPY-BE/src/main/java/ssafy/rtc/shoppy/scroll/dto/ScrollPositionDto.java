package ssafy.rtc.shoppy.scroll.dto;

import jakarta.validation.constraints.NotNull;

public record ScrollPositionDto(
        @NotNull Long userId,
        @NotNull Double scrollX,
        @NotNull Double scrollY
) {}
