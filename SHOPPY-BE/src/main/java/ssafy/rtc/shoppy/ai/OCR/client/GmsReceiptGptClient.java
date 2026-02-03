package ssafy.rtc.shoppy.ai.ocr.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ssafy.rtc.shoppy.ai.config.GmsProperties;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GmsReceiptGptClient implements ReceiptGptClient {

    private static final int LOG_SNIPPET_LIMIT = 1200;
    private static final String SYSTEM_PROMPT = ""
            + "너는 영수증 분석기다.\n"
            + "출력은 반드시 JSON만 반환한다.\n"
            + "items 배열만 정확히 채운다.\n"
            + "한글 상품명만 items에 넣고 상호/주소/카드정보는 제외한다.\n"
            + "unitPrice, quantity, amount는 정수로 출력한다.\n"
            + "amount가 없으면 unitPrice * quantity로 계산해 넣는다.\n"
            + "불확실하면 warnings에 이유를 넣고, 그래도 최선의 값을 채운다.";

    private static final String USER_PROMPT = ""
            + "다음 영수증 이미지에서 구매 항목들을 추출해 주세요.\n"
            + "규칙:\n"
            + "1) 반드시 아래 JSON 스키마만 출력하세요. 다른 텍스트 금지.\n"
            + "2) 한글 상품명만 items에 넣으세요(상호명/주소/카드정보 제외).\n"
            + "3) unitPrice, quantity, amount는 정수. 쉼표 제거.\n"
            + "4) amount가 없으면 unitPrice * quantity로 계산해서 넣으세요.\n"
            + "5) 불확실하면 warnings에 이유를 넣고, 그래도 최선의 값을 채우세요.\n"
            + "\n"
            + "스키마:\n"
            + "{\n"
            + "  \"items\": [\n"
            + "    { \"name\": string, \"unitPrice\": number, \"quantity\": number, \"amount\": number }\n"
            + "  ],\n"
            + "  \"currency\": \"KRW\",\n"
            + "  \"warnings\": [string]\n"
            + "}";

    private final RestTemplate restTemplate;
    private final String model;

    public GmsReceiptGptClient(RestTemplateBuilder builder,
                               GmsProperties gmsProperties,
                               @Value("${gms.ocr.model:gpt-5.2-pro}") String model) {
        String baseUrl = gmsProperties.getBaseUrl();
        String apiKey = gmsProperties.getApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("GMS API 키가 설정되어 있지 않습니다.");
        }
        this.model = model;
        this.restTemplate = builder
                .rootUri(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
        log.info("GMS OCR 클라이언트 초기화 완료. baseUrl={}, model={}", baseUrl, model);
    }

    @Override
    public String analyzeReceiptToJson(String base64Image) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", model);
        payload.put("messages", buildMessages(base64Image));
        payload.put("temperature", 0.0);
        payload.put("max_tokens", 800);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity("/chat/completions", payload, JsonNode.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new BusinessException(ErrorCode.OCR_502_GPT_UPSTREAM_FAIL, "GMS OCR 응답 오류");
            }
            JsonNode body = response.getBody();
            String content = extractContent(body);
            if (!StringUtils.hasText(content)) {
                throw new BusinessException(ErrorCode.OCR_422_PARSE_FAIL, "GMS OCR content가 비어 있습니다.");
            }
            log.info("GMS OCR content(일부): {}", truncateForLog(content));
            return content;
        } catch (RestClientException ex) {
            throw new BusinessException(ErrorCode.OCR_502_GPT_UPSTREAM_FAIL, "GMS OCR 호출 실패", ex.getMessage());
        }
    }

    private List<Map<String, Object>> buildMessages(String base64Image) {
        Map<String, Object> system = Map.of(
                "role", "system",
                "content", SYSTEM_PROMPT
        );

        Map<String, Object> textPart = Map.of(
                "type", "text",
                "text", USER_PROMPT
        );
        Map<String, Object> imagePart = Map.of(
                "type", "image_url",
                "image_url", Map.of("url", base64Image)
        );

        Map<String, Object> user = Map.of(
                "role", "user",
                "content", List.of(textPart, imagePart)
        );

        return List.of(system, user);
    }

    private String extractContent(JsonNode body) {
        JsonNode choices = body.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            log.warn("GMS OCR 응답에 choices가 없습니다.");
            return null;
        }
        JsonNode message = choices.get(0).path("message");
        return message.path("content").asText();
    }

    private String truncateForLog(String value) {
        if (value == null) {
            return "null";
        }
        if (value.length() <= LOG_SNIPPET_LIMIT) {
            return value;
        }
        return value.substring(0, LOG_SNIPPET_LIMIT) + "...(truncated)";
    }
}