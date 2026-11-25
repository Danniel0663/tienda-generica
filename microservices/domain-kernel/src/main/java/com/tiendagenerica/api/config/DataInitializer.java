package com.tiendagenerica.api.config;

import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.bootstrap-admin", matchIfMissing = true, havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsById(9000000000L)) {
            Usuario admin = new Usuario();
            admin.setCedula(9000000000L);
            admin.setNombreCompleto("Administrador Inicial");
            admin.setCorreoElectronico("admininicial@tienda.local");
            admin.setUsuario("admininicial");
            admin.setContrasena(passwordEncoder.encode("admin123456"));
            admin.setActivo(true);
            usuarioRepository.save(admin);
        }
    }
}