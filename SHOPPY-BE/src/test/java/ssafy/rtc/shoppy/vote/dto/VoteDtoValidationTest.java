package ssafy.rtc.shoppy.vote.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Vote DTO Validation 테스트")
class VoteDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Nested
    @DisplayName("VoteCreateRequestDto 검증")
    class VoteCreateRequestDtoTest {

        @Test
        @DisplayName("유효한 요청 - 검증 통과")
        void valid_Request_NoViolations() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "점심 메뉴 투표",
                    List.of("한식", "중식", "일식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("제목이 null - 검증 실패")
        void nullTitle_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    null,
                    List.of("한식", "중식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("title")));
        }

        @Test
        @DisplayName("제목이 빈 문자열 - 검증 실패")
        void emptyTitle_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "",
                    List.of("한식", "중식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("title")));
        }

        @Test
        @DisplayName("제목이 공백만 - 검증 실패")
        void blankTitle_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "   ",
                    List.of("한식", "중식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("title")));
        }

        @Test
        @DisplayName("옵션이 null - 검증 실패")
        void nullOptions_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "점심 메뉴 투표",
                    null
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("options")));
        }

        @Test
        @DisplayName("옵션이 빈 리스트 - 검증 실패")
        void emptyOptions_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "점심 메뉴 투표",
                    Collections.emptyList()
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("options")));
        }

        @Test
        @DisplayName("옵션이 1개만 - 검증 실패 (최소 2개)")
        void singleOption_Violation() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "점심 메뉴 투표",
                    List.of("한식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getMessage().contains("2개 이상")));
        }

        @Test
        @DisplayName("옵션이 정확히 2개 - 검증 통과")
        void twoOptions_NoViolations() {
            // given
            VoteCreateRequestDto request = new VoteCreateRequestDto(
                    "점심 메뉴 투표",
                    List.of("한식", "중식")
            );

            // when
            Set<ConstraintViolation<VoteCreateRequestDto>> violations = validator.validate(request);

            // then
            assertTrue(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("VoteParticipateRequestDto 검증")
    class VoteParticipateRequestDtoTest {

        @Test
        @DisplayName("유효한 요청 - 검증 통과")
        void valid_Request_NoViolations() {
            // given
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(1L);

            // when
            Set<ConstraintViolation<VoteParticipateRequestDto>> violations = validator.validate(request);

            // then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("optionId가 null - 검증 실패")
        void nullOptionId_Violation() {
            // given
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(null);

            // when
            Set<ConstraintViolation<VoteParticipateRequestDto>> violations = validator.validate(request);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("optionId")));
        }
    }
}
