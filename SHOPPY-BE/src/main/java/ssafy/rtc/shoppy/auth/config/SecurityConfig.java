package ssafy.rtc.shoppy.auth.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ssafy.rtc.shoppy.auth.jwt.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableConfigurationProperties({ KakaoProperties.class, JwtProperties.class })
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Auth, Swagger, WebSocket
                        .requestMatchers("/auth/kakao/**", "/auth/refresh", "/auth/test/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll()
                        .requestMatchers("/ws/**", "/api/ws/**").permitAll()
                        .requestMatchers("/api/actuator/**").permitAll()

                        // Room: 공개 엔드포인트
                        .requestMatchers(HttpMethod.GET, "/rooms/code/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/rooms/join/guest").permitAll()
                        .requestMatchers(HttpMethod.POST, "/rooms/*/leave/beacon").permitAll()
                        .requestMatchers(HttpMethod.GET, "/rooms/*/members").permitAll()
                        .requestMatchers(HttpMethod.GET, "/rooms/*").permitAll()

                        // WebRTC, Shopping, Product, AI: 전체 공개
                        .requestMatchers("/rooms/*/webrtc/**").permitAll()
                        .requestMatchers("/rooms/*/shopping-items/**").permitAll()
                        .requestMatchers("/products/**").permitAll()
                        .requestMatchers("/ai/**").permitAll()
                        .requestMatchers("/rooms/*/ai-checklist/**").permitAll()

                        // Vote: 목록 조회만 공개
                        .requestMatchers(HttpMethod.GET, "/rooms/*/votes").permitAll()

                        // Settlement: auth 미사용 엔드포인트만 공개
                        .requestMatchers("/receipts/*/items").permitAll()
                        .requestMatchers("/settlement-items/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/settlements/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/settlements/*/receipts").permitAll()
                        .requestMatchers(HttpMethod.POST, "/settlements/*/complete").permitAll()

                        // 나머지 전부 인증 필요
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
