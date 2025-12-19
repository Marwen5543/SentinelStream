package org.example.sentinelstream.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // Disable CSRF → fixes SockJS /ws/info 403
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**", "/api/**").permitAll()  // Allow WebSocket + REST
                        .anyRequest().permitAll()                         // Allow everything else (dev)
                )
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.setAllowedOriginPatterns(java.util.List.of("*"));
                    corsConfig.setAllowedMethods(java.util.List.of("*"));
                    corsConfig.setAllowedHeaders(java.util.List.of("*"));
                    corsConfig.setAllowCredentials(true);
                    return corsConfig;
                }));

        return http.build();
    }
}