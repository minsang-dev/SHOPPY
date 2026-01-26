package ssafy.rtc.shoppy.ai.llm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.ai.llm.domain.AiChecklistCodes;
import ssafy.rtc.shoppy.ai.llm.dto.AiChecklistResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateRequestDto;
import ssafy.rtc.shoppy.ai.llm.dto.AiRoomCreateResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.ChecklistCategoryResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.ChecklistItemResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomConstraintsResponseDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomInfoDto;
import ssafy.rtc.shoppy.ai.llm.dto.RoomMetaResponseDto;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistEntity;
import ssafy.rtc.shoppy.ai.llm.entity.AiChecklistItemEntity;
import ssafy.rtc.shoppy.ai.llm.entity.RecommendationTemplateEntity;
import ssafy.rtc.shoppy.ai.llm.entity.RoomConstraintsEntity;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistItemRepository;
import ssafy.rtc.shoppy.ai.llm.repository.AiChecklistRepository;
import ssafy.rtc.shoppy.ai.llm.repository.RecommendationTemplateRepository;
import ssafy.rtc.shoppy.ai.llm.repository.RoomConstraintsRepository;
import ssafy.rtc.shoppy.ai.llm.service.model.AiChecklistInput;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCandidate;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCategoryDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistItemDraft;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiRoomService {

    private final RoomRepository roomRepository;
    private final RoomConstraintsRepository constraintsRepository;
    private final RecommendationTemplateRepository templateRepository;
    private final AiChecklistRepository checklistRepository;
    private final AiChecklistItemRepository checklistItemRepository;
    private final LlmClient llmClient;
    private final RoomConstraintsValidator validator;

    @Transactional
    public AiRoomCreateResponseDto createRoomWithChecklist(AiRoomCreateRequestDto request, Long hostId) {
        validator.validate(request);

        Room room = Room.create(hostId, request.roomMeta().roomName(), request.roomMeta().targetBudget(), request.roomMeta().syncMode());
        RoomEntity savedRoom = roomRepository.save(RoomEntity.fromDomain(room));

        RoomConstraintsEntity constraints = RoomConstraintsEntity.from(
                savedRoom.getRoomId(),
                request.roomConstraints(),
                request.roomMeta().minBudget()
        );
        constraintsRepository.save(constraints);

        List<String> templateCategories = normalizeCategoriesForTemplateQuery(constraints.getInterestCategoryCodes());
        List<RecommendationTemplateEntity> candidates = templateRepository.findActiveCandidates(
                constraints.getPurposeCode(),
                templateCategories
        );

        List<RecommendationTemplateEntity> filteredCandidates = TemplateFilter.excludeByTraits(candidates, constraints.getTraitCodes());

        ChecklistDraft draft = generateDraftSafely(request, filteredCandidates);
        if (draft.categories().isEmpty()) {
            draft = fallbackDraft(filteredCandidates);
        }

        checklistRepository.deleteByRoomId(savedRoom.getRoomId());
        AiChecklistEntity checklist = checklistRepository.save(AiChecklistEntity.create(savedRoom.getRoomId()));

        List<AiChecklistItemEntity> items = toEntities(checklist, draft);
        checklistItemRepository.saveAll(items);

        return toCreateResponse(savedRoom, request, constraints, checklist, items);
    }

    private ChecklistDraft generateDraftSafely(AiRoomCreateRequestDto request, List<RecommendationTemplateEntity> candidates) {
        AiChecklistInput input = new AiChecklistInput(
                request.roomConstraints().purpose(),
                request.roomConstraints().peopleCount(),
                request.roomMeta().minBudget(),
                request.roomMeta().targetBudget(),
                request.roomConstraints().interestCategories(),
                request.roomConstraints().traits(),
                candidates.stream()
                        .map(candidate -> new ChecklistCandidate(
                                normalizeCategory(candidate.getCategoryCode()),
                                candidate.getItemName(),
                                candidate.getPriority()
                        ))
                        .toList()
        );
        try {
            return llmClient.generateChecklist(input);
        } catch (Exception ex) {
            return new ChecklistDraft(List.of());
        }
    }

    private ChecklistDraft fallbackDraft(List<RecommendationTemplateEntity> candidates) {
        Map<String, List<RecommendationTemplateEntity>> grouped = candidates.stream()
                .sorted(Comparator.comparingInt(RecommendationTemplateEntity::getPriority))
                .collect(Collectors.groupingBy(candidate -> normalizeCategory(candidate.getCategoryCode())));

        List<ChecklistCategoryDraft> categories = new ArrayList<>();
        Map<String, List<String>> defaultItems = defaultFallbackItems();
        for (String code : AiChecklistCodes.CHECKLIST_CATEGORY_ORDER) {
            List<ChecklistItemDraft> items = grouped.getOrDefault(code, List.of()).stream()
                    .limit(5)
                    .map(template -> new ChecklistItemDraft(template.getItemName(), "Template-based suggestion."))
                    .toList();
            if (items.isEmpty()) {
                items = defaultItems.getOrDefault(code, List.of()).stream()
                        .map(name -> new ChecklistItemDraft(name, "Fallback suggestion."))
                        .toList();
            }
            if (!items.isEmpty()) {
                categories.add(new ChecklistCategoryDraft(code, items));
            }
        }

        return new ChecklistDraft(categories);
    }

    private Map<String, List<String>> defaultFallbackItems() {
        return Map.of(
                "MEAT_PROTEIN", List.of("Chicken", "Pork", "Tofu"),
                "VEGETABLE", List.of("Onion", "Carrot", "Lettuce"),
                "FRESH", List.of("Eggs", "Milk", "Fruit"),
                "DRINK", List.of("Water", "Juice", "Tea"),
                "ALCOHOL", List.of("Beer", "Soju", "Wine"),
                "SNACK", List.of("Chips", "Cookies", "Nuts"),
                "COOKING", List.of("Oil", "Salt", "Disposable plates"),
                "SUPPLY", List.of("Tissue", "Detergent", "Trash bags")
        );
    }

    private List<String> normalizeCategoriesForTemplateQuery(List<String> categories) {
        if (categories == null) {
            return List.of();
        }
        List<String> normalized = new ArrayList<>();
        for (String category : categories) {
            normalized.add(category);
            if ("MEAT".equals(category)) {
                normalized.add("MEAT_PROTEIN");
            }
        }
        return normalized.stream().distinct().toList();
    }

    private String normalizeCategory(String categoryCode) {
        if ("MEAT".equals(categoryCode)) {
            return "MEAT_PROTEIN";
        }
        return categoryCode;
    }

    private List<AiChecklistItemEntity> toEntities(AiChecklistEntity checklist, ChecklistDraft draft) {
        List<AiChecklistItemEntity> items = new ArrayList<>();
        for (ChecklistCategoryDraft category : draft.categories()) {
            int sortOrder = 1;
            for (ChecklistItemDraft item : category.items()) {
                items.add(AiChecklistItemEntity.create(
                        checklist,
                        category.code(),
                        item.name(),
                        item.reason(),
                        sortOrder
                ));
                sortOrder++;
            }
        }
        return items;
    }

    private AiRoomCreateResponseDto toCreateResponse(
            RoomEntity room,
            AiRoomCreateRequestDto request,
            RoomConstraintsEntity constraints,
            AiChecklistEntity checklist,
            List<AiChecklistItemEntity> items
    ) {
        return new AiRoomCreateResponseDto(
                new RoomInfoDto(room.getRoomId(), room.getHostId()),
                new RoomMetaResponseDto(
                        request.roomMeta().roomName(),
                        room.getRoomCode(),
                        room.getStatus(),
                        request.roomMeta().type(),
                        request.roomMeta().targetBudget(),
                        request.roomMeta().minBudget(),
                        room.getSyncMode()
                ),
                new RoomConstraintsResponseDto(
                        constraints.getPurposeCode(),
                        constraints.getPeopleCount(),
                        constraints.getInterestCategoryCodes(),
                        constraints.getTraitCodes()
                ),
                buildChecklistResponse(checklist, items)
        );
    }

    private AiChecklistResponseDto buildChecklistResponse(AiChecklistEntity checklist, List<AiChecklistItemEntity> items) {
        Map<String, List<AiChecklistItemEntity>> grouped = items.stream()
                .collect(Collectors.groupingBy(AiChecklistItemEntity::getCategoryCode));

        List<ChecklistCategoryResponseDto> categories = new ArrayList<>();
        for (String code : AiChecklistCodes.CHECKLIST_CATEGORY_ORDER) {
            List<ChecklistItemResponseDto> itemDtos = grouped.getOrDefault(code, List.of()).stream()
                    .sorted(Comparator.comparingInt(item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
                    .map(item -> new ChecklistItemResponseDto(
                            item.getChecklistItemId(),
                            item.getItemName(),
                            item.isChecked(),
                            item.getReason(),
                            item.getSortOrder()
                    ))
                    .toList();
            if (!itemDtos.isEmpty()) {
                categories.add(new ChecklistCategoryResponseDto(code, AiChecklistCodes.labelForCategory(code), itemDtos));
            }
        }

        return new AiChecklistResponseDto(checklist.getChecklistId(), checklist.getGeneratedAt(), categories);
    }
}
