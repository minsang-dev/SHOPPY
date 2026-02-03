package ssafy.rtc.shoppy.ai.ocr.util;

import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptItemDto;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ReceiptNumberNormalizer {

    private static final Pattern DIGITS = Pattern.compile("(\\d+)");

    private ReceiptNumberNormalizer() {
    }

    public static void normalizeInPlace(ReceiptOcrAnalyzeData data) {
        if (data == null) {
            return;
        }
        List<ReceiptItemDto> items = data.getItems();
        if (items == null) {
            return;
        }
        List<String> warnings = data.getWarnings();
        if (warnings == null) {
            warnings = new ArrayList<>();
            data.setWarnings(warnings);
        }

        for (ReceiptItemDto item : items) {
            if (item == null) {
                continue;
            }
            if (item.getName() != null) {
                item.setName(item.getName().trim());
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                item.setQuantity(1);
                warnings.add("수량이 불명확한 항목이 있어 1로 처리했습니다: " + safeName(item));
            }

            if (item.getAmount() == null) {
                if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    item.setAmount(item.getUnitPrice() * item.getQuantity());
                } else {
                    warnings.add("금액(amount)을 계산할 수 없는 항목이 있습니다: " + safeName(item));
                }
            }
        }
    }

    public static Integer parseIntLoose(String s) {
        if (s == null) {
            return null;
        }
        String cleaned = s.replace(",", "").replace(" ", "");
        Matcher m = DIGITS.matcher(cleaned);
        if (!m.find()) {
            return null;
        }
        try {
            return Integer.parseInt(m.group(1));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String safeName(ReceiptItemDto item) {
        return item.getName() == null ? "(이름없음)" : item.getName();
    }
}