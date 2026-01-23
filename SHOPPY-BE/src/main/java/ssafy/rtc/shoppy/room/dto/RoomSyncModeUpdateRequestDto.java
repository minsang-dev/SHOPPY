package ssafy.rtc.shoppy.room.dto;

import jakarta.validation.constraints.NotNull;
import ssafy.rtc.shoppy.room.enums.SyncMode;

public record RoomSyncModeUpdateRequestDto(
        @NotNull
        SyncMode syncMode
) {
}
