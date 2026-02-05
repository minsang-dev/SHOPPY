package ssafy.rtc.shoppy.ai.ocr.client;

public interface ReceiptGptClient {
    String analyzeReceiptToJson(String base64Image);
}