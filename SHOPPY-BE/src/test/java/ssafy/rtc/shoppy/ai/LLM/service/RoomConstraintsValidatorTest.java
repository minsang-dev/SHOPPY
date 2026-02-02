package ssafy.rtc.shoppy.ai.llm.service;

import org.junit.jupiter.api.Test;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomMetaRequestDto;
import ssafy.rtc.shoppy.global.exception.BusinessException;

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
                "MT",
                3,
                List.of("MEAT_RAW", "DRINK_NON_ALCOHOL"),
                traits,
                new BigDecimal("10000"),
                BigDecimal.ZERO
        );
        return new AiRoomCreateRequestDto(meta);
    }
}
