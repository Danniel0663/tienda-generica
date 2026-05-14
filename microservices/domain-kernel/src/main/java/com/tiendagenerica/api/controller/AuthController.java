package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.auth.LoginRequest;
import com.tiendagenerica.api.dto.auth.LoginResponse;
import com.tiendagenerica.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}