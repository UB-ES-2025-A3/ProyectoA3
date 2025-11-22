package com.eventmanager.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CorsLoggingFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(CorsLoggingFilter.class);

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {

    String origin = request.getHeader("Origin");
    log.info("[CORS-REQ] {} {} Origin={}", request.getMethod(), request.getRequestURI(), origin);

    filterChain.doFilter(request, response);

    String allowOrigin = response.getHeader("Access-Control-Allow-Origin");
    log.info("[CORS-RES] {} {} Status={} Access-Control-Allow-Origin={}",
        request.getMethod(), request.getRequestURI(), response.getStatus(), allowOrigin);
  }
}
