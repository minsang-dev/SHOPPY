package ssafy.rtc.shoppy.webrtc.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

@Configuration
@EnableConfigurationProperties({ OpenViduProperties.class, WebRtcProperties.class })
public class WebRtcConfig {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder()
                .requestFactory(new SimpleClientHttpRequestFactory() {
                    @Override
                    protected void prepareConnection(HttpURLConnection connection, String httpMethod)
                            throws IOException {
                        if (connection instanceof HttpsURLConnection) {
                            ((HttpsURLConnection) connection).setHostnameVerifier((hostname, session) -> true);
                            try {
                                ((HttpsURLConnection) connection).setSSLSocketFactory(createTrustAllSslSocketFactory());
                            } catch (Exception e) {
                                throw new RuntimeException("Failed to create SSL Socket Factory", e);
                            }
                        }
                        super.prepareConnection(connection, httpMethod);
                    }
                });
    }

    private SSLSocketFactory createTrustAllSslSocketFactory() throws NoSuchAlgorithmException, KeyManagementException {
        TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                    }
                }
        };
        SSLContext sc = SSLContext.getInstance("TLS");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        return sc.getSocketFactory();
    }
}
