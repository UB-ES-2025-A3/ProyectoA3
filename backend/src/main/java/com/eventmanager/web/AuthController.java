// web/AuthController.java
package com.eventmanager.web;

import com.eventmanager.dto.AuthDtos.*;
import com.eventmanager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final AuthService svc;
  public AuthController(AuthService s){this.svc=s;}
  @PostMapping("/signup") public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignUpRequest r){ return ResponseEntity.ok(svc.signUp(r)); }
  @PostMapping("/login")  public ResponseEntity<AuthResponse> login (@Valid @RequestBody LoginRequest  r){ return ResponseEntity.ok(svc.login(r)); }
}
