package com.eventmanager.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    log.info("[CORS] Configurando CORS MUY ABIERTO para DEBUG");

    registry.addMapping("/**")
        .allowedOrigins("*")      // solo para debug / APIs sin cookies
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(false); // con "*" no se puede true

    log.info("[CORS] Orígenes permitidos: *");
    log.info("[CORS] Métodos permitidos: *");
    log.info("[CORS] Credenciales permitidas: false");
  }
}
