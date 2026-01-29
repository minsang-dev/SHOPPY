package ssafy.rtc.shoppy.ai.llm.service;

import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.ai.llm.domain.AiChecklistCodes;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomConstraintsRequestDto;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class RoomConstraintsValidator {

    public void validate(AiRoomCreateRequestDto request) {
        RoomConstraintsRequestDto constraints = request.roomConstraints();
        if (!AiChecklistCodes.PURPOSE_CODES.contains(constraints.purpose())) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "유효하지 않은 목적 코드입니다.");
        }
        validateCategories(constraints.interestCategories());
        validateTraits(constraints.traits());
        validateBudgets(request.roomMeta().minBudget(), request.roomMeta().targetBudget());
    }

    private void validateCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "관심 카테고리가 필요합니다.");
        }
        for (String category : categories) {
            if (!AiChecklistCodes.INTEREST_CATEGORY_CODES.contains(category)) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "유효하지 않은 관심 카테고리입니다.");
            }
        }
    }

    private void validateTraits(List<String> traits) {
        if (traits == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "특성 선택이 필요합니다.");
        }
        Set<String> traitSet = new HashSet<>(traits);
        for (String trait : traitSet) {
            if (!AiChecklistCodes.TRAIT_CODES.contains(trait)) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "유효하지 않은 특성 코드입니다.");
            }
        }
        for (AiChecklistCodes.TraitPair pair : AiChecklistCodes.MUTEX_TRAITS) {
            if (traitSet.contains(pair.left()) && traitSet.contains(pair.right())) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "서로 충돌하는 특성이 선택되었습니다.");
            }
        }
    }

    private void validateBudgets(BigDecimal minBudget, BigDecimal targetBudget) {
        if (minBudget == null || targetBudget == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "예산이 필요합니다.");
        }
        if (minBudget.compareTo(BigDecimal.ZERO) < 0 || targetBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "예산은 음수일 수 없습니다.");
        }
        if (minBudget.compareTo(targetBudget) > 0) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "최소 예산은 목표 예산을 초과할 수 없습니다.");
        }
    }
}
