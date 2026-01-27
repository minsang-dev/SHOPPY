package ssafy.rtc.shoppy.settlement.utils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ReceiptParser {

    // 금액 패턴: 숫자, 콤마(,), 원(선택)
    private static final Pattern PRICE_PATTERN = Pattern.compile("([0-9,]+)(?:원)?");
    
    // 품목 라인 패턴 (단순화): (품명) ... (금액)
    // 예: "김치찌개 8,000" 또는 "공기밥 1000"
    // 라인 끝에 숫자가 있어야 함.
    private static final Pattern ITEM_LINE_PATTERN = Pattern.compile("^(.*)\\s+([0-9,]+)(?:원)?$");

    // 총액 키워드
    private static final String[] TOTAL_KEYWORDS = {
            "합계", "총액", "Total", "결제금액", "받을금액", "결제하실금액", "CREDIT CARD", "신용카드", "승인금액"
    };

    // 제외 키워드 (품목이 아닌 것들)
    private static final String[] EXCLUDE_KEYWORDS = {
            "합계", "총액", "결제", "카드", "부가세", "과세", "면세", "할인", "반품", "일시불", "승인", "매출", "전화", "TEL", "사업자", "대표", "가맹점"
    };

    public record ParsedItem(String itemName, BigDecimal unitPrice, int quantity) {}

    /**
     * OCR 전체 텍스트에서 총액을 추정하여 반환합니다.
     */
    public static BigDecimal parseTotalAmount(String fullText) {
        // (기존 코드 유지)
        if (fullText == null || fullText.isBlank()) {
            return BigDecimal.ZERO;
        }

        String[] lines = fullText.split("\n");
        BigDecimal maxAmount = BigDecimal.ZERO;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (containsKeyword(line, TOTAL_KEYWORDS)) {
                BigDecimal amount = extractPrice(line);
                if (amount == null && i + 1 < lines.length) {
                    amount = extractPrice(lines[i + 1].trim());
                }
                if (amount != null && amount.compareTo(maxAmount) > 0) {
                    maxAmount = amount;
                }
            }
        }
        return maxAmount;
    }

    /**
     * OCR 텍스트에서 개별 품목을 추출합니다.
     */
    public static List<ParsedItem> parseItems(String fullText) {
        List<ParsedItem> items = new ArrayList<>();
        if (fullText == null || fullText.isBlank()) return items;

        String[] lines = fullText.split("\n");

        for (String line : lines) {
            line = line.trim();
            
            // 제외 키워드가 있으면 스킵 (합계, 카드 정보 등)
            if (containsKeyword(line, EXCLUDE_KEYWORDS)) continue;

            // 라인 끝이 숫자로 끝나는지 확인
            // 단순화: 수량은 1로 가정 (OCR로 수량까지 정확히 구분하기는 매우 어려움)
            Matcher matcher = ITEM_LINE_PATTERN.matcher(line);
            if (matcher.find()) {
                String namePart = matcher.group(1).trim();
                String pricePart = matcher.group(2).replace(",", "");

                if (namePart.length() < 2) continue; // 이름이 너무 짧으면 제외

                try {
                    BigDecimal price = new BigDecimal(pricePart);
                    // 가격이 0원이거나 너무 큰 경우(전화번호 오탐 등) 제외
                    // 예: 100원 ~ 1000만원 사이
                    if (price.compareTo(new BigDecimal("100")) >= 0 && price.compareTo(new BigDecimal("10000000")) < 0) {
                        items.add(new ParsedItem(namePart, price, 1));
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return items;
    }

    private static boolean containsKeyword(String line, String[] keywords) {
        for (String keyword : keywords) {
            if (line.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private static BigDecimal extractPrice(String text) {
        Matcher matcher = PRICE_PATTERN.matcher(text);
        BigDecimal maxInLine = null;
        while (matcher.find()) {
            String numStr = matcher.group(1).replace(",", "");
            try {
                if (numStr.length() > 9) continue;
                BigDecimal val = new BigDecimal(numStr);
                if (val.compareTo(BigDecimal.ZERO) > 0) {
                     if (maxInLine == null || val.compareTo(maxInLine) > 0) {
                         maxInLine = val;
                     }
                }
            } catch (NumberFormatException ignored) {}
        }
        return maxInLine;
    }
}
