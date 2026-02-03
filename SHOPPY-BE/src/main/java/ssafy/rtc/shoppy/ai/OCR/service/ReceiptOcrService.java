package ssafy.rtc.shoppy.ai.ocr.service;

import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;

public interface ReceiptOcrService {
    ReceiptOcrAnalyzeData analyze(MultipartFile file, boolean debug);
}