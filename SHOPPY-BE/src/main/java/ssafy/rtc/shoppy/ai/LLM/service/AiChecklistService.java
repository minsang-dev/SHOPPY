package ssafy.rtc.shoppy.ai.llm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.ai.llm.domain.AiChecklistCodes;
import ssafy.rtc.shoppy.ai.llm.dto.AiChecklistResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.ChecklistCategoryResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.ChecklistItemResponseDto;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistEntity;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistItemEntity;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistItemRepository;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiChecklistService {

        private final AiChecklistRepository checklistRepository;
        private final AiChecklistItemRepository checklistItemRepository;

        @Transactional(readOnly = true)
        public AiChecklistResponseDto getChecklist(long roomId) {
                AiChecklistEntity checklist = checklistRepository.findByRoomId(roomId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "체크리스트를 찾을 수 없습니다."));

                List<AiChecklistItemEntity> items = checklistItemRepository
                                .findByChecklist_ChecklistIdOrderBySortOrderAsc(checklist.getChecklistId());

                return buildChecklistResponse(checklist, items);
        }

        @Transactional
        public void toggleChecklistItem(long roomId, long checklistItemId, boolean checked) {
                AiChecklistEntity checklist = checklistRepository.findByRoomId(roomId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "체크리스트를 찾을 수 없습니다."));

                AiChecklistItemEntity item = checklistItemRepository
                                .findByChecklist_ChecklistIdAndChecklistItemId(checklist.getChecklistId(),
                                                checklistItemId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "체크리스트 항목을 찾을 수 없습니다."));

                item.updateChecked(checked);
        }

        @Transactional
        public void deleteChecklistItem(long roomId, long checklistItemId) {
                AiChecklistEntity checklist = checklistRepository.findByRoomId(roomId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "체크리스트를 찾을 수 없습니다."));

                AiChecklistItemEntity item = checklistItemRepository
                                .findByChecklist_ChecklistIdAndChecklistItemId(checklist.getChecklistId(),
                                                checklistItemId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "체크리스트 항목을 찾을 수 없습니다."));

                checklistItemRepository.delete(item);
        }

        private AiChecklistResponseDto buildChecklistResponse(AiChecklistEntity checklist,
                        List<AiChecklistItemEntity> items) {
                Map<String, List<AiChecklistItemEntity>> grouped = items.stream()
                                .collect(Collectors.groupingBy(AiChecklistItemEntity::getCategoryCode));

                List<ChecklistCategoryResponseDto> categories = new ArrayList<>();
                for (String code : AiChecklistCodes.CHECKLIST_CATEGORY_ORDER) {
                        List<ChecklistItemResponseDto> itemDtos = grouped.getOrDefault(code, List.of()).stream()
                                        .sorted(Comparator.comparingInt(
                                                        item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
                                        .map(item -> new ChecklistItemResponseDto(
                                                        item.getChecklistItemId(),
                                                        item.getItemName(),
                                                        item.getItemSize(),
                                                        item.isChecked(),
                                                        item.getReason(),
                                                        item.getSortOrder()))
                                        .toList();
                        if (!itemDtos.isEmpty()) {
                                categories.add(new ChecklistCategoryResponseDto(code,
                                                AiChecklistCodes.labelForCategory(code), itemDtos));
                        }
                }

                return new AiChecklistResponseDto(checklist.getChecklistId(), checklist.getGeneratedAt(), categories);
        }
}
