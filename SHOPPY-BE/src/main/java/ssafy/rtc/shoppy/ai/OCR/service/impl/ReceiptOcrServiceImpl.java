package ssafy.rtc.shoppy.ai.ocr.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.ai.ocr.client.ReceiptGptClient;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrService;
import ssafy.rtc.shoppy.ai.ocr.util.ReceiptJsonParser;
import ssafy.rtc.shoppy.ai.ocr.util.ReceiptNumberNormalizer;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ReceiptOcrServiceImpl implements ReceiptOcrService {

    private final ReceiptGptClient receiptGptClient;
    private final ReceiptJsonParser receiptJsonParser;

    @Override
    public ReceiptOcrAnalyzeData analyze(MultipartFile file, boolean debug) {
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String contentType = file.getContentType();
            String dataUrl = StringUtils.hasText(contentType)
                    ? "data:" + contentType + ";base64," + base64
                    : base64;

            String raw = receiptGptClient.analyzeReceiptToJson(dataUrl);
            ReceiptOcrAnalyzeData data = receiptJsonParser.parseToData(raw, debug);
            ReceiptNumberNormalizer.normalizeInPlace(data);
            return data;
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "OCR 파일 처리 중 오류가 발생했습니다.", ex.getMessage());
        }
    }
}