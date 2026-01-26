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
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Invalid purpose code.");
        }
        validateCategories(constraints.interestCategories());
        validateTraits(constraints.traits());
        validateBudgets(request.roomMeta().minBudget(), request.roomMeta().targetBudget());
    }

    private void validateCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Interest categories are required.");
        }
        for (String category : categories) {
            if (!AiChecklistCodes.INTEREST_CATEGORY_CODES.contains(category)) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Invalid interest category.");
            }
        }
    }

    private void validateTraits(List<String> traits) {
        if (traits == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Traits are required.");
        }
        Set<String> traitSet = new HashSet<>(traits);
        for (String trait : traitSet) {
            if (!AiChecklistCodes.TRAIT_CODES.contains(trait)) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Invalid trait code.");
            }
        }
        for (AiChecklistCodes.TraitPair pair : AiChecklistCodes.MUTEX_TRAITS) {
            if (traitSet.contains(pair.left()) && traitSet.contains(pair.right())) {
                throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Conflicting trait selection.");
            }
        }
    }

    private void validateBudgets(BigDecimal minBudget, BigDecimal targetBudget) {
        if (minBudget == null || targetBudget == null) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Budget is required.");
        }
        if (minBudget.compareTo(BigDecimal.ZERO) < 0 || targetBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Budget cannot be negative.");
        }
        if (minBudget.compareTo(targetBudget) > 0) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "Min budget cannot exceed target budget.");
        }
    }
}
