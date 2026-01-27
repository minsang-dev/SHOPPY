package ssafy.rtc.shoppy.ai.llm.service;

import org.junit.jupiter.api.Test;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomConstraintsRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomMetaRequestDto;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.room.enums.SyncMode;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RoomConstraintsValidatorTest {

    private final RoomConstraintsValidator validator = new RoomConstraintsValidator();

    @Test
    void validateAcceptsValidRequest() {
        AiRoomCreateRequestDto request = sampleRequest(List.of("VALUE", "ALCOHOL_NO", "INDOOR"));
        assertDoesNotThrow(() -> validator.validate(request));
    }

    @Test
    void validateRejectsConflictingTraits() {
        AiRoomCreateRequestDto request = sampleRequest(List.of("VALUE", "PREMIUM"));
        assertThrows(BusinessException.class, () -> validator.validate(request));
    }

    private AiRoomCreateRequestDto sampleRequest(List<String> traits) {
        RoomMetaRequestDto meta = new RoomMetaRequestDto(
                "Room A",
                "offline",
                new BigDecimal("10000"),
                BigDecimal.ZERO,
                SyncMode.FOLLOW
        );
        RoomConstraintsRequestDto constraints = new RoomConstraintsRequestDto(
                "MT",
                3,
                List.of("MEAT", "DRINK"),
                traits
        );
        return new AiRoomCreateRequestDto(meta, constraints);
    }
}
