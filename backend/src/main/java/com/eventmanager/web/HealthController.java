// src/main/java/com/eventmanager/web/HealthController.java
package com.eventmanager.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
  @GetMapping("/ping")
  public String ping() { return "pong"; }
}
