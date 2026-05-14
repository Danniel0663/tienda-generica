package com.tiendagenerica.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.tiendagenerica.api.dto.usuario.UsuarioRequest;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, new BCryptPasswordEncoder());
    }

    @Test
    void actualizarDebePreservarContrasenaSiNoSeEnviaUnaNueva() {
        Usuario existing = new Usuario();
        existing.setCedula(123L);
        existing.setNombreCompleto("Usuario Base");
        existing.setCorreoElectronico("base@tienda.com");
        existing.setUsuario("usuariobase");
        existing.setContrasena("hash-original");
        existing.setActivo(true);

        UsuarioRequest request = new UsuarioRequest();
        request.setCedula(123L);
        request.setNombreCompleto("  Usuario Actualizado  ");
        request.setCorreoElectronico("ACTUALIZADO@TIENDA.COM");
        request.setUsuario("Usuario.Actualizado");
        request.setContrasena("   ");
        request.setActivo(false);

        when(usuarioRepository.findById(123L)).thenReturn(Optional.of(existing));
        when(usuarioRepository.existsByUsuarioIgnoreCaseAndCedulaNot(anyString(), anyLong())).thenReturn(false);
        when(usuarioRepository.existsByCorreoElectronicoIgnoreCaseAndCedulaNot(anyString(), anyLong())).thenReturn(false);
        when(usuarioRepository.save(existing)).thenReturn(existing);

        usuarioService.actualizar(123L, request);

        assertEquals("hash-original", existing.getContrasena());
        assertEquals("Usuario Actualizado", existing.getNombreCompleto());
        assertEquals("actualizado@tienda.com", existing.getCorreoElectronico());
        assertEquals("usuario.actualizado", existing.getUsuario());
        assertFalse(existing.getActivo());
    }
}
