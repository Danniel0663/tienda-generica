package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.auth.LoginRequest;
import com.tiendagenerica.api.dto.auth.LoginResponse;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.repository.UsuarioRepository;
import com.tiendagenerica.api.security.AuthTokenService;
import com.tiendagenerica.api.util.InputSanitizer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService authTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedUser = InputSanitizer.normalizeLowerCase(request.getUsuario());

        Usuario usuario = usuarioRepository.findByUsuarioIgnoreCaseAndActivoTrue(normalizedUser)
                .orElseThrow(() -> new BusinessException("Usuario o contraseña errados, intente de nuevo"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new BusinessException("Usuario o contraseña errados, intente de nuevo");
        }

        AuthTokenService.GeneratedToken generatedToken = authTokenService.generateFor(usuario);

        return new LoginResponse(
                usuario.getCedula(),
                usuario.getNombreCompleto(),
                usuario.getUsuario(),
                generatedToken.token(),
                "Bearer",
                generatedToken.expiresAt(),
                "Ingreso correcto");
    }
}
