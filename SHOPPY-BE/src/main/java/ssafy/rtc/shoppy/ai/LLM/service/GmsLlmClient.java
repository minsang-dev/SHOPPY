package ssafy.rtc.shoppy.ai.llm.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ssafy.rtc.shoppy.ai.config.GmsProperties;
import ssafy.rtc.shoppy.ai.llm.domain.AiChecklistCodes;
import ssafy.rtc.shoppy.ai.llm.service.model.AiChecklistInput;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCategoryDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistCandidate;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistDraft;
import ssafy.rtc.shoppy.ai.llm.service.model.ChecklistItemDraft;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@Primary
public class GmsLlmClient implements LlmClient {

    private static final int LOG_SNIPPET_LIMIT = 2000;
    private static final int MAX_DUMP_CHARS = 20000;
    private static final Path DUMP_DIR = Paths.get("..\\..\\ai\\LLM\\JsonParsingFail");
    private static final DateTimeFormatter DUMP_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");
    private static final List<String> FIXED_INTEREST_CATEGORIES = List.copyOf(
            AiChecklistCodes.INTEREST_CATEGORY_CODES
    );

        private static final String SYSTEM_PROMPT = "??? AI ???? ?????? ???? ??????.\n" +
            "?? JSON ?? ??? ?????. ????, ??, ?? ??? ???? ???.\n" +
            "? item? reason? ?? 60??? ??/????, ??/??/?? ??? ???? ??, " +
            "?? ??/??/?? ??/traits? ?????.\n" +
            "item_size? ???? ?? ????? ???? ???? ?? ??? ?????.\n" +
            "?? ?? ??: headcount 1-2 = x1, 3-4 = x1.5, 5-6 = x2, 7-8 = x2.5, 9+ = x3\n" +
            "MEAT_RAW? ? ???? ? ??? ????, 2~3? ??? ?? ????? (?: ? 1.6kg = 700g+500g+400g).";

private static final String DEFAULT_REASON = "조건 기반 추천";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GmsLlmClient(RestTemplateBuilder builder, GmsProperties gmsProperties, ObjectMapper objectMapper) {
        String baseUrl = gmsProperties.getBaseUrl();
        String apiKey = gmsProperties.getApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("GMS API 키가 설정되어 있지 않습니다.");
        }
        this.objectMapper = objectMapper;
        this.restTemplate = builder
                .rootUri(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
        log.info("GMS 클라이언트가 {}로 초기화되었습니다.", baseUrl);
    }

    @Override
    public ChecklistDraft generateChecklist(AiChecklistInput input) {
        Map<String, Object> payload = new LinkedHashMap<>();
        List<Map<String, String>> messages = buildMessages(input);
        payload.put("model", "gpt-4o-mini");
        payload.put("messages", messages);
        payload.put("temperature", 0.25);
        payload.put("max_tokens", 1024);
        payload.put("top_p", 0.8);

        try {
            log.info(
                    "GMS 요청 시작. 목적={}, 인원수={}, 최소예산={}, 목표예산={}, 관심카테고리수={}, 특성수={}, 후보수={}",
                    input.purpose(), input.peopleCount(), input.minBudget(), input.targetBudget(),
                    input.interestCategories().size(), input.traits().size(), input.candidates().size());
            log.info("GMS 요청 페이로드 키={}, 메시지수={}, 모델={}, 최대토큰={}",
                    payload.keySet(), messages.size(), payload.get("model"), payload.get("max_tokens"));
            ResponseEntity<JsonNode> response = restTemplate.postForEntity("/chat/completions", payload, JsonNode.class);
            log.info("GMS 응답 상태={}", response.getStatusCode());
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("GMS API 응답이 성공 코드가 아닙니다: {}", response.getStatusCode());
                return new ChecklistDraft(Collections.emptyList());
            }
            JsonNode body = response.getBody();
            if (body == null) {
                log.warn("GMS API 응답 바디가 없습니다.");
                return new ChecklistDraft(Collections.emptyList());
            }
            String rawBody = body.toString();
            log.info("GMS 원문 응답(잘림): {}", truncateForLog(rawBody));
            Optional<GmsChecklistDraft> draft = parseResponse(body, rawBody);
            return draft.map(this::toChecklistDraft).orElseGet(() -> new ChecklistDraft(Collections.emptyList()));
        } catch (RestClientException | JsonProcessingException ex) {
            log.warn("GMS 체크리스트 생성 실패", ex);
            return new ChecklistDraft(Collections.emptyList());
        }
    }

    private List<Map<String, String>> buildMessages(AiChecklistInput input) {
        String userMessage = buildUserMessage(input);
        log.info("GMS 시스템 프롬프트(잘림): {}", truncateForLog(SYSTEM_PROMPT));
        log.info("GMS 사용자 메시지(잘림): {}", truncateForLog(userMessage));
        Map<String, String> system = Map.of("role", "system", "content", SYSTEM_PROMPT);
        Map<String, String> user = Map.of("role", "user", "content", userMessage);
        return List.of(system, user);
    }

    private String buildUserMessage(AiChecklistInput input) {
        String interest = input.interestCategories().isEmpty() ? "없음" : String.join(", ", input.interestCategories());
        String traits = input.traits().isEmpty() ? "없음" : String.join(", ", input.traits());
        String candidates = input.candidates().isEmpty()
                ? "없음"
                : input.candidates().stream()
                        .sorted(Comparator.comparingInt(ChecklistCandidate::priority))
                        .map(candidate -> String.format("- %s | %s | size %s (priority %d)",
                                candidate.categoryCode(),
                                candidate.itemName(),
                                StringUtils.hasText(candidate.itemSize()) ? candidate.itemSize() : "N/A",
                                candidate.priority()))
                        .collect(Collectors.joining("\n"));
        String budgets = String.format("minBudget %s / targetBudget %s",
                input.minBudget().toPlainString(), input.targetBudget().toPlainString());
        String normalizedInterestInfo = "레거시 코드 사용 금지: FOOD/MEAT/VEGETABLE/FRESH/DRINK/COOKING 대신 "
                + "FOOD_READY/MEAT_RAW/VEGETABLE_RAW/FRESH_READY/DRINK_NON_ALCOHOL/COOKING_TOOL를 사용하세요.";
        String allowedChecklistOrder = String.join(", ", AiChecklistCodes.CHECKLIST_CATEGORY_ORDER);
        String allowedInterestList = String.join(", ", FIXED_INTEREST_CATEGORIES);

        return String.format(
                "다음 요청에 따라 체크리스트를 JSON으로 만들어 주세요.\n" +
                        "- 목적: %s\n" +
                        "- 관심 카테고리: %s\n" +
                        "- traits: %s\n" +
                        "- 예산: %s\n" +
                        "- 인원: %d\n" +
                        "- 후보 샘플:\n%s\n" +
                        "- 후보에 size가 포함되면 기본 용량으로 참고하고 인원수에 따라 수량을 조정하세요.\n" +
                        "- 수량 배수 규칙: headcount 1-2 = x1, 3-4 = x1.5, 5-6 = x2, 7-8 = x2.5, 9+ = x3 / 수량배수 규칙은 엄격하지 않으니까 참고용으로만 사용하세요.\n" +
                        "- MEAT_RAW는 총 고기량을 계산한 뒤 2~3개 부위로 나눠 추천하세요 (예: 총 1.6kg = 700g+500g+400g).\n" +
                        "- MEAT_RAW는 돼지고기/소고기 부위를 우선 추천하고 닭/오리는 보조로만 사용하세요.\n" +
                        "체크리스트 카테고리 순서: %s\n" +
                        "사용 가능한 관심 카테고리: %s\n" +
                        "%s\n" +
                        "아래 조건을 만족하며 JSON({\"categories\":[...]})만 응답하세요.\n" +
                        "1) 각 category는 code와 items(최소 3개, 최대 8개 권장)를 포함하고, code는 허용된 순서 중 하나여야 합니다.\n" +
                        "2) items.name은 한국어 명사형으로 작성하고 중복 없이 정렬하세요.\n" +
                        "3) reason은 60자 이내이며 가격/브랜드/수량/할인/통계 표현 없이 목적/인원/traits/예산 범위만 참고하세요.\n" +
                        "4) 특정 category의 items이 부족하면, 해당 category에 한해 최대 2개까지 추가 추천할 수 있습니다.\r\n" + //
                                                        "(단, 추가 추천도 허용된 카테고리 코드만 사용)\n" +
                        "5) 실패하거나 반영할 내용이 없으면 {\"categories\":[]}로 반환하세요.\n",
                escapeForFormat(input.purpose()),
                escapeForFormat(interest),
                escapeForFormat(traits),
                escapeForFormat(budgets),
                input.peopleCount(),
                escapeForFormat(candidates),
                escapeForFormat(allowedChecklistOrder),
                escapeForFormat(allowedInterestList),
                escapeForFormat(normalizedInterestInfo)
        );
    }

    private Optional<GmsChecklistDraft> parseResponse(JsonNode body, String rawBody) throws JsonProcessingException {
        JsonNode choices = body.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            log.warn("GMS 응답에 choices가 없습니다.");
            return Optional.empty();
        }
        JsonNode message = choices.get(0).path("message");
        if (message == null || !message.has("content")) {
            log.warn("GMS 응답에서 message.content가 없습니다.");
            return Optional.empty();
        }
        String content = message.get("content").asText();
        log.info("GMS 메시지 콘텐츠(잘림): {}", truncateForLog(content));
        String jsonText = extractJson(content);
        if (!StringUtils.hasText(jsonText)) {
            log.warn("GMS 응답에서 JSON 추출에 실패했습니다.");
            dumpParsingFailure("extractJson", rawBody, content, jsonText, null);
            return Optional.empty();
        }

        try {
            log.info("GMS 추출 JSON(잘림): {}", truncateForLog(jsonText));
            GmsChecklistDraft draft = objectMapper.readValue(jsonText, GmsChecklistDraft.class);
            return Optional.of(draft);
        } catch (JsonProcessingException ex) {
            dumpParsingFailure("readValue", rawBody, content, jsonText, ex);
            throw ex;
        }
    }

    private String extractJson(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end >= 0 && end >= start) {
            return content.substring(start, end + 1).trim();
        }
        return content.trim();
    }

    private ChecklistDraft toChecklistDraft(GmsChecklistDraft draft) {
        List<ChecklistCategoryDraft> categories = new ArrayList<>();
        for (GmsCategory category : draft.categories()) {
            if (category.items() == null) {
                continue;
            }
            Set<String> seenNames = new LinkedHashSet<>();
            List<ChecklistItemDraft> items = new ArrayList<>();
            for (GmsItem item : category.items()) {
                if (!StringUtils.hasText(item.name())) {
                    continue;
                }
                String name = item.name().trim();
                if (seenNames.contains(name)) {
                    continue;
                }
                seenNames.add(name);
                String reason = sanitizeReason(item.reason());
                items.add(new ChecklistItemDraft(name, reason));
                if (items.size() >= 8) {
                    break;
                }
            }
            if (!items.isEmpty()) {
                String normalizedCode = normalizeChecklistCode(category.code());
                categories.add(new ChecklistCategoryDraft(normalizedCode, items));
            }
        }
        return new ChecklistDraft(categories);
    }

    private String normalizeChecklistCode(String code) {
        if (!StringUtils.hasText(code)) {
            return code;
        }
        return switch (code.trim()) {
            case "FOOD" -> "FOOD_READY";
            case "MEAT" -> "MEAT_RAW";
            case "VEGETABLE" -> "VEGETABLE_RAW";
            case "FRESH" -> "FRESH_READY";
            case "DRINK" -> "DRINK_NON_ALCOHOL";
            case "COOKING" -> "COOKING_TOOL";
            default -> code;
        };
    }

    private String sanitizeReason(String reason) {
        if (!StringUtils.hasText(reason)) {
            return DEFAULT_REASON;
        }
        String normalized = reason.replaceAll("\\s+", " ").trim();
        if (normalized.length() > 60) {
            normalized = normalized.substring(0, 60).trim();
        }
        if (!StringUtils.hasText(normalized)) {
            return DEFAULT_REASON;
        }
        return normalized;
    }

    private String escapeForFormat(String value) {
        return value == null ? "" : value.replace("%", "%%");
    }

    private String truncateForLog(String value) {
        if (value == null) {
            return "null";
        }
        if (value.length() <= LOG_SNIPPET_LIMIT) {
            return value;
        }
        return value.substring(0, LOG_SNIPPET_LIMIT) + "...(잘림)";
    }

    private void dumpParsingFailure(String stage, String rawBody, String content, String extractedJson, Exception ex) {
        try {
            java.nio.file.Files.createDirectories(DUMP_DIR);
            String ts = LocalDateTime.now().format(DUMP_TIME_FORMAT);
            String fileName = String.format("gms_parse_fail_%s_%s_%s.txt", stage, ts, UUID.randomUUID());
            Path target = DUMP_DIR.resolve(fileName);
            StringBuilder sb = new StringBuilder();
            sb.append("단계=").append(stage).append('\n');
            if (ex != null) {
                sb.append("예외=").append(ex.getClass().getName()).append('\n');
                sb.append("메시지=").append(ex.getMessage()).append('\n');
            }
            sb.append("원문응답=").append(truncateForDump(rawBody)).append('\n');
            sb.append("메시지본문=").append(truncateForDump(content)).append('\n');
            sb.append("추출JSON=").append(truncateForDump(extractedJson)).append('\n');
            java.nio.file.Files.writeString(target, sb.toString(), StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE_NEW);
            log.warn("GMS 파싱 실패 덤프 저장: {}", target.toAbsolutePath());
        } catch (Exception dumpEx) {
            log.warn("GMS 파싱 실패 덤프 저장 실패", dumpEx);
        }
    }

    private String truncateForDump(String value) {
        if (value == null) {
            return "null";
        }
        if (value.length() <= MAX_DUMP_CHARS) {
            return value;
        }
        return value.substring(0, MAX_DUMP_CHARS) + "...(잘림)";
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static record GmsChecklistDraft(List<GmsCategory> categories) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static record GmsCategory(String code, List<GmsItem> items) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static record GmsItem(String name, String reason) {
    }
}
