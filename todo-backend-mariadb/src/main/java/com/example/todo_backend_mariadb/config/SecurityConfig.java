package com.example.todo_backend_mariadb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

//    Oauth2 적용 전
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        // corsConfigurationSource() 이거 밑에 정의하니까 빨갛게 뜨는거 정상입니다.
//        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .csrf(csrf -> csrf.disable())
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(authz ->
//                        // prefLight 요청(OPTION 메서드)은 인증없이 모두 허용
//                        authz.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                                // 이제 /api 관련 경로는 인증된 사용자만 접근 가능하도록 변경
//                                .requestMatchers("/api/**").authenticated() // .permitAll() 에서 수정
//                                .anyRequest().authenticated() // .permitAll() 에서 수정
//                );
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz ->
                        // preflight 요청(OPTION METHOD)은 인증 없이 모두 허용
                        authz.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                // 현재 로그인 기능이 따로 없으므로, 모든 API 요청을 임시로 허용
                                .requestMatchers("/api/**").authenticated()
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
