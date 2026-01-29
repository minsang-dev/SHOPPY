package ssafy.rtc.shoppy.ai.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "gms")
public class GmsProperties {

    private static final ObjectMapper KEY_MAPPER = new ObjectMapper();
    private static final List<String> KEY_CANDIDATES = List.of("token", "gmsKey", "apiKey", "key");

    /**
     * GMS API 기본 URL. 
     */
    private String baseUrl = "https://gms.ssafy.io/gmsapi/api.openai.com/v1";

    /**
     * GMS bearer 토큰. 제공되지 않을 경우에는 local file 내에서 가져옴 >> {@link #apiKeyFile}.
     */
    private String apiKey;

    /**
     * 토큰이 있는 local file 경로
     */
    private String apiKeyFile = "ai/api/gms_key.json";

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getApiKeyFile() {
        return apiKeyFile;
    }

    public String getApiKey() {
        if (StringUtils.hasText(apiKey)) {
            return apiKey.trim();
        }
        try {
            String value = Files.readString(Path.of(apiKeyFile));
            return extractTokenFromJson(value);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read GMS key from " + apiKeyFile, e);
        }
    }

    private String extractTokenFromJson(String jsonContent) {
        try {
            JsonNode root = KEY_MAPPER.readTree(jsonContent);
            for (String candidate : KEY_CANDIDATES) {
                if (root.has(candidate) && StringUtils.hasText(root.get(candidate).asText())) {
                    return root.get(candidate).asText().trim();
                }
            }
        } catch (IOException ignored) {
            
        }
        throw new IllegalStateException("GMS key not found in " + apiKeyFile + " (expected fields: " + KEY_CANDIDATES + ")");
    }
}
