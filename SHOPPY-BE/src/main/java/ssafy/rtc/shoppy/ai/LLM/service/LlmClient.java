package ssafy.rtc.shoppy.ai.llm.service;

import ssafy.rtc.shoppy.ai.llm.service.model.AiChecklistInput;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistDraft;

public interface LlmClient {
    ChecklistDraft generateChecklist(AiChecklistInput input);
}
