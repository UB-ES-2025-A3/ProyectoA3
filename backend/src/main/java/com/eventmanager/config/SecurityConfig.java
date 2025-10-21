package com.eventmanager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
  public static final String PASSWORD_REGEX =
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{6,}$";

  @Value("${app.cors.allowed-origins}")
  private String allowedOrigins;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
    return http.build();
  }
  @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  public CorsFilter corsFilter() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowCredentials(true);
    cfg.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    cfg.addAllowedHeader("*"); cfg.addAllowedMethod("*");
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return new CorsFilter(src);
  }
}
