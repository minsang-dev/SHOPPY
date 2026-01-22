package ssafy.rtc.shoppy.webrtc.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.http.HttpClient;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

@Configuration
@EnableConfigurationProperties({OpenViduProperties.class, WebRtcProperties.class})
public class WebRtcConfig {

    /**
     * 로컬 개발 환경용 RestClient.Builder
     * Self-signed 인증서를 신뢰하도록 SSL 검증 우회
     *
     * WARNING: 프로덕션 환경에서는 절대 사용하지 말 것!
     */
    @Bean
    @Profile("local")
    public RestClient.Builder restClientBuilder() throws NoSuchAlgorithmException, KeyManagementException {
        // 모든 인증서를 신뢰하는 TrustManager
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };

        // SSL 컨텍스트 설정
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

        // HttpClient 생성 (SSL 검증 우회)
        HttpClient httpClient = HttpClient.newBuilder()
                .sslContext(sslContext)
                .build();

        // RestClient.Builder에 적용
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);

        return RestClient.builder()
                .requestFactory(requestFactory);
    }
}
