package ssafy.rtc.shoppy.cursor.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 공유커서 위치 DTO
 * 프론트엔드 → 백엔드 → 프론트엔드로 그대로 전달 (pass-through)
 */
public record CursorPositionDto(
        @NotNull Long userId,
        @NotNull String nickname,
        @NotNull String colorKey,
        @NotNull Double x,
        @NotNull Double y
) {}
