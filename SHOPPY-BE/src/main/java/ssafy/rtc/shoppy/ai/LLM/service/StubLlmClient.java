package ssafy.rtc.shoppy.ai.llm.service;

import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.ai.llm.domain.AiChecklistCodes;
import ssafy.rtc.shoppy.ai.llm.service.model.AiChecklistInput;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCandidate;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCategoryDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistItemDraft;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class StubLlmClient implements LlmClient {

    @Override
    public ChecklistDraft generateChecklist(AiChecklistInput input) {
        Map<String, List<ChecklistCandidate>> grouped = input.candidates().stream()
                .sorted(Comparator.comparingInt(ChecklistCandidate::priority))
                .collect(Collectors.groupingBy(ChecklistCandidate::categoryCode));

        List<ChecklistCategoryDraft> categories = new ArrayList<>();
        for (String code : AiChecklistCodes.CHECKLIST_CATEGORY_ORDER) {
            List<ChecklistItemDraft> items = grouped.getOrDefault(code, List.of()).stream()
                    .limit(5)
                    .map(candidate -> new ChecklistItemDraft(candidate.itemName(), "방 정보에 기반한 추천입니다."))
                    .toList();
            if (!items.isEmpty()) {
                categories.add(new ChecklistCategoryDraft(code, items));
            }
        }

        return new ChecklistDraft(categories);
    }
}
