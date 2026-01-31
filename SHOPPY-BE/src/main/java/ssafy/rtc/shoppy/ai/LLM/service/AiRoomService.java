package ssafy.rtc.shoppy.ai.llm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
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
    private final ReferenceRuleEngine referenceRuleEngine;

    @Transactional
    public AiRoomCreateResponseDto createRoomWithChecklist(AiRoomCreateRequestDto request, Long hostId) {
        validator.validate(request);

        Room room = Room.create(hostId, request.roomMeta().roomName(), request.roomMeta().targetBudget());
        RoomEntity savedRoom = roomRepository.save(RoomEntity.fromDomain(room));

        RoomConstraintsEntity constraints = RoomConstraintsEntity.from(
                savedRoom.getRoomId(),
                request.roomConstraints(),
                request.roomMeta().minBudget(),
                request.roomMeta().targetBudget());
        constraintsRepository.save(constraints);

        List<String> templateCategories = normalizeCategoriesForTemplateQuery(constraints.getInterestCategoryCodes());
        List<RecommendationTemplateEntity> candidates = templateRepository.findActiveCandidates(
                constraints.getPurposeCode(),
                templateCategories);
        candidates = applyReferenceRules(candidates, constraints.getPurposeCode(), constraints.getTraitCodes());

        // 1) 중복 제거 (category+item 기준, priority 높은 걸 채택)
        List<RecommendationTemplateEntity> dedupedCandidates = dedupeCandidates(candidates);

        // 2) 제외 필터
        List<RecommendationTemplateEntity> filteredCandidates = TemplateFilter.excludeByTraits(
                dedupedCandidates,
                constraints.getTraitCodes());

        // 3) 점수 정렬 (CONSUMABLE 우대, TOOL 약우대, EQUIPMENT 페널티, NO_COOKING 패널티)
        List<RecommendationTemplateEntity> sortedCandidates = TemplateFilter.sortByTraitScore(
                filteredCandidates,
                constraints.getTraitCodes());

        // (로그) 흐름 확인용
        if (log.isDebugEnabled()) {
            log.debug("[TEMPLATE] candidates={}, deduped={}, filtered={}, sorted={}",
                    (candidates == null ? 0 : candidates.size()),
                    dedupedCandidates.size(),
                    filteredCandidates.size(),
                    sortedCandidates.size());
        }

        ChecklistDraft draft = generateDraftSafely(request, sortedCandidates);
        if (draft.categories().isEmpty()) {
            draft = fallbackDraft(sortedCandidates);
        }

        if (log.isDebugEnabled()) {
    int limit = Math.min(20, sortedCandidates.size());
    for (int i = 0; i < limit; i++) {
        RecommendationTemplateEntity c = sortedCandidates.get(i);

        // tags는 DB trait_excludes에서 CONSUMABLE/TOOL/EQUIPMENT만 읽히는 구조라,
        // 여기서는 그냥 trait_excludes를 같이 찍어도 운영 점검에 충분히 도움이 됨.
        int finalScore = TemplateFilter.scoreForDebug(c, constraints.getTraitCodes());

        log.debug("[RECOMMEND] rank={}, item={}, basePriority={}, trait_excludes={}, finalScore={}",
                (i + 1),
                c.getItemName(),
                c.getPriority(),
                c.getTraitExcludes(),
                finalScore
        );
    }
}

        checklistRepository.deleteByRoomId(savedRoom.getRoomId());
        AiChecklistEntity checklist = checklistRepository.save(AiChecklistEntity.create(savedRoom.getRoomId()));

        List<AiChecklistItemEntity> items = toEntities(checklist, draft);
        checklistItemRepository.saveAll(items);

        return toCreateResponse(savedRoom, request, constraints, checklist, items);
    }

    private ChecklistDraft generateDraftSafely(AiRoomCreateRequestDto request,
            List<RecommendationTemplateEntity> candidates) {
        AiChecklistInput input = new AiChecklistInput(
                request.roomConstraints().purpose(),
                request.roomConstraints().peopleCount(),
                request.roomMeta().minBudget(),
                request.roomMeta().targetBudget(),
                request.roomConstraints().interestCategories(),
                request.roomConstraints().traits(),
                candidates.stream()
                        .map(candidate -> new ChecklistCandidate(
                                effectiveCategory(candidate),
                                candidate.getItemName(),
                                candidate.getPriority()))
                        .toList());
        try {
            return llmClient.generateChecklist(input);
        } catch (Exception ex) {
            return new ChecklistDraft(List.of());
        }
    }

    private ChecklistDraft fallbackDraft(List<RecommendationTemplateEntity> candidates) {
        Map<String, List<RecommendationTemplateEntity>> grouped = candidates.stream()
                .sorted(Comparator.comparingInt(RecommendationTemplateEntity::getPriority))
                .collect(Collectors.groupingBy(this::effectiveCategory));

        List<ChecklistCategoryDraft> categories = new ArrayList<>();
        Map<String, List<String>> defaultItems = defaultFallbackItems();
        for (String code : AiChecklistCodes.CHECKLIST_CATEGORY_ORDER) {
            List<ChecklistItemDraft> items = grouped.getOrDefault(code, List.of()).stream()
                    .limit(5)
                    .map(template -> new ChecklistItemDraft(template.getItemName(), "템플릿 기반 추천입니다."))
                    .toList();
            if (items.isEmpty()) {
                items = defaultItems.getOrDefault(code, List.of()).stream()
                        .map(name -> new ChecklistItemDraft(name, "대체 추천입니다."))
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
                "MEAT_PROTEIN", List.of("닭고기", "돼지고기", "두부"),
                "VEGETABLE", List.of("양파", "당근", "상추"),
                "FRESH", List.of("달걀", "우유", "과일"),
                "DRINK", List.of("물", "주스", "차"),
                "ALCOHOL", List.of("맥주", "소주", "와인"),
                "SNACK", List.of("감자칩", "쿠키", "견과류"),
                "COOKING", List.of("식용유", "소금", "일회용 접시"),
                "SUPPLY", List.of("휴지", "세제", "쓰레기봉투"));
    }

    private List<String> normalizeCategoriesForTemplateQuery(List<String> categories) {
        List<String> normalized = new ArrayList<>();

        if (categories != null) {
            for (String category : categories) {
                normalized.add(category);
                addLegacyCategoryForQuery(normalized, category);
            }
        }

        normalized.add("DRINK_NON_ALCOHOL");
        normalized.add("SNACK");
        normalized.add("COOKING_TOOL");
        normalized.add("SUPPLY");
        addLegacyCategoryForQuery(normalized, "DRINK_NON_ALCOHOL");
        addLegacyCategoryForQuery(normalized, "COOKING_TOOL");

        return normalized.stream().distinct().toList();
    }

    private String normalizeCategory(String categoryCode) {
        if (categoryCode == null) {
            return null;
        }
        return switch (categoryCode) {
            case "MEAT" -> "MEAT_RAW";
            case "MEAT_PROTEIN" -> "MEAT_RAW";
            case "VEGETABLE" -> "VEGETABLE_RAW";
            case "FRESH" -> "FRESH_READY";
            case "DRINK" -> "DRINK_NON_ALCOHOL";
            case "COOKING" -> "COOKING_TOOL";
            default -> categoryCode;
        };
    }

    private void addLegacyCategoryForQuery(List<String> normalized, String category) {
        if (category == null) {
            return;
        }
        switch (category) {
            case "MEAT_RAW" -> normalized.add("MEAT_PROTEIN");
            case "VEGETABLE_RAW" -> normalized.add("VEGETABLE");
            case "FRESH_READY" -> normalized.add("FRESH");
            case "DRINK_NON_ALCOHOL" -> normalized.add("DRINK");
            case "COOKING_TOOL" -> normalized.add("COOKING");
            case "FOOD" -> {
                normalized.add("MEAT_PROTEIN");
                normalized.add("VEGETABLE");
                normalized.add("FRESH");
            }
            default -> {
            }
        }
    }

    private List<RecommendationTemplateEntity> applyReferenceRules(
            List<RecommendationTemplateEntity> candidates,
            String purpose,
            List<String> traits
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        ReferenceRuleEngine.PurposeRule purposeRule = referenceRuleEngine.loadPurposeRule(purpose);
        List<ReferenceRuleEngine.TraitRule> traitRules = referenceRuleEngine.loadTraitRules(traits);
        ReferenceRuleEngine.ComposedRule composedRule = referenceRuleEngine.compose(purposeRule, traitRules, traits);

        Set<String> allowedCategories = composedRule.categoryRules().keySet();
        List<RecommendationTemplateEntity> filtered = candidates.stream()
                .filter(candidate -> allowedCategories.contains(effectiveCategory(candidate)))
                .toList();

        List<RecommendationTemplateEntity> byBanTraits = filterByBanTraits(filtered, traits);
        return filterByKeywords(byBanTraits, composedRule.banKeywords(), composedRule.allowKeywords());
    }

    private List<RecommendationTemplateEntity> filterByBanTraits(
            List<RecommendationTemplateEntity> candidates,
            List<String> traits
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }
        if (traits == null || traits.isEmpty()) {
            return candidates;
        }
        Set<String> traitSet = new java.util.HashSet<>(traits);
        return candidates.stream()
                .filter(candidate -> {
                    List<String> banTraits = candidate.getBanTraits();
                    if (banTraits == null || banTraits.isEmpty()) {
                        return true;
                    }
                    return banTraits.stream().noneMatch(traitSet::contains);
                })
                .toList();
    }

    private String effectiveCategory(RecommendationTemplateEntity candidate) {
        if (candidate == null) {
            return null;
        }
        String code = candidate.getNewCategoryCode();
        if (code == null || code.isBlank()) {
            return null;
        }
        return normalizeCategory(code);
    }

    private List<RecommendationTemplateEntity> filterByKeywords(
            List<RecommendationTemplateEntity> candidates,
            Set<String> banKeywords,
            Set<String> allowKeywords
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }
        if ((banKeywords == null || banKeywords.isEmpty())
                && (allowKeywords == null || allowKeywords.isEmpty())) {
            return candidates;
        }

        return candidates.stream()
                .filter(candidate -> {
                    String name = candidate.getItemName();
                    if (name == null || name.isBlank()) {
                        return false;
                    }
                    boolean allowed = allowKeywords != null
                            && allowKeywords.stream().anyMatch(name::contains);
                    boolean banned = banKeywords != null
                            && banKeywords.stream().anyMatch(name::contains);
                    return !banned || allowed;
                })
                .toList();
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
                        sortOrder));
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
            List<AiChecklistItemEntity> items) {
        return new AiRoomCreateResponseDto(
                new RoomInfoDto(room.getRoomId(), room.getHostId()),
                new RoomMetaResponseDto(
                        request.roomMeta().roomName(),
                        room.getRoomCode(),
                        room.getStatus(),
                        request.roomMeta().type(),
                        request.roomMeta().targetBudget(),
                        request.roomMeta().minBudget()),
                new RoomConstraintsResponseDto(
                        constraints.getPurposeCode(),
                        constraints.getPeopleCount(),
                        constraints.getInterestCategoryCodes(),
                        constraints.getTraitCodes()),
                buildChecklistResponse(checklist, items));
    }

    private AiChecklistResponseDto buildChecklistResponse(AiChecklistEntity checklist,
            List<AiChecklistItemEntity> items) {
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
                            item.getSortOrder()))
                    .toList();
            if (!itemDtos.isEmpty()) {
                categories
                        .add(new ChecklistCategoryResponseDto(code, AiChecklistCodes.labelForCategory(code), itemDtos));
            }
        }

        return new AiChecklistResponseDto(checklist.getChecklistId(), checklist.getGeneratedAt(), categories);
    }

    private List<RecommendationTemplateEntity> dedupeCandidates(List<RecommendationTemplateEntity> candidates) {
    if (candidates == null || candidates.isEmpty()) {
        return List.of();
    }

    // category_code + item_name 기준으로 중복 제거
    // (동일 키가 여러 개면 priority 높은 것을 채택)
    return new java.util.ArrayList<>(
            candidates.stream()
                    .collect(Collectors.toMap(
                            c -> effectiveCategory(c) + "|" + c.getItemName(),
                            c -> c,
                            (a, b) -> a.getPriority() >= b.getPriority() ? a : b
                    ))
                    .values()
    );
}

}
