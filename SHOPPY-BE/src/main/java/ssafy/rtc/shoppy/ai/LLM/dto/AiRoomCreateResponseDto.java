package ssafy.rtc.shoppy.ai.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiRoomCreateResponseDto(
        RoomInfoDto roomInfo,
        RoomMetaResponseDto roomMeta,
        RoomConstraintsResponseDto roomConstraints,
        @JsonProperty("ai_checkList")
        AiChecklistResponseDto aiCheckList
) {
}
