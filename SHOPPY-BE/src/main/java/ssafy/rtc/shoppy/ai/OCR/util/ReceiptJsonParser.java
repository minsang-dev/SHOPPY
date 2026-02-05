package ssafy.rtc.shoppy.ai.ocr.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptItemDto;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrDebugDto;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReceiptJsonParser {

    private final ObjectMapper objectMapper;

    public ReceiptOcrAnalyzeData parseToData(String gptRaw, boolean debug) {
        if (!StringUtils.hasText(gptRaw)) {
            throw new BusinessException(ErrorCode.OCR_422_PARSE_FAIL, "OCR 응답이 비어 있습니다.");
        }
        try {
            String json = extractJsonObject(gptRaw);
            JsonNode root = objectMapper.readTree(json);
            ReceiptOcrAnalyzeData data = new ReceiptOcrAnalyzeData();

            if (root.hasNonNull("currency")) {
                data.setCurrency(root.get("currency").asText("KRW"));
            }

            List<String> warnings = new ArrayList<>();
            if (root.has("warnings") && root.get("warnings").isArray()) {
                for (JsonNode w : root.get("warnings")) {
                    warnings.add(w.asText());
                }
            }
            data.setWarnings(warnings);

            List<ReceiptItemDto> items = new ArrayList<>();
            JsonNode itemsNode = root.get("items");
            if (itemsNode != null && itemsNode.isArray()) {
                for (JsonNode it : itemsNode) {
                    items.add(ReceiptItemDto.builder()
                            .name(textOrNull(it, "name"))
                            .unitPrice(intOrNull(it, "unitPrice"))
                            .quantity(intOrNull(it, "quantity"))
                            .amount(intOrNull(it, "amount"))
                            .build());
                }
            } else {
                warnings.add("items 배열이 없거나 비어있습니다.");
            }
            data.setItems(items);

            if (debug) {
                data.setDebug(ReceiptOcrDebugDto.builder()
                        .rawResponse(gptRaw)
                        .extractedJson(json)
                        .build());
            }

            return data;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.OCR_422_PARSE_FAIL, "OCR 결과 파싱 실패", ex.getMessage());
        }
    }

    private String extractJsonObject(String raw) {
        String cleaned = raw.trim().replace("```json", "```");
        if (cleaned.startsWith("```")) {
            int end = cleaned.lastIndexOf("```");
            if (end > 0) {
                cleaned = cleaned.substring(3, end).trim();
            }
        }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) {
            throw new BusinessException(ErrorCode.OCR_422_PARSE_FAIL, "JSON 객체를 찾지 못했습니다.");
        }
        return cleaned.substring(start, end + 1).trim();
    }

    private String textOrNull(JsonNode node, String key) {
        JsonNode v = node.get(key);
        return (v == null || v.isNull()) ? null : v.asText();
    }

    private Integer intOrNull(JsonNode node, String key) {
        JsonNode v = node.get(key);
        if (v == null || v.isNull()) {
            return null;
        }
        if (v.isInt() || v.isLong()) {
            return v.asInt();
        }
        return ReceiptNumberNormalizer.parseIntLoose(v.asText());
    }
}