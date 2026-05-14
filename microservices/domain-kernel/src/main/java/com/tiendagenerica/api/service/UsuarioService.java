package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.usuario.UsuarioRequest;
import com.tiendagenerica.api.dto.usuario.UsuarioResponse;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.exception.NotFoundException;
import com.tiendagenerica.api.repository.UsuarioRepository;
import com.tiendagenerica.api.util.InputSanitizer;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UsuarioService {

    private static final int PASSWORD_MIN_LENGTH = 8;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse crear(UsuarioRequest req) {
        if (usuarioRepository.existsById(req.getCedula())) {
            throw new BusinessException("Ya existe un usuario con esa cédula");
        }

        Usuario entity = new Usuario();
        map(req, entity, true);
        usuarioRepository.save(entity);
        return toResponse(entity);
    }

    public UsuarioResponse obtenerPorCedula(Long cedula) {
        return toResponse(getEntity(cedula));
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "nombreCompleto")).stream()
                .map(this::toResponse)
                .toList();
    }

    public UsuarioResponse actualizar(Long cedula, UsuarioRequest req) {
        validateIdentifierMatch(cedula, req.getCedula(), "cédula del usuario");

        Usuario entity = getEntity(cedula);
        map(req, entity, false);
        usuarioRepository.save(entity);
        return toResponse(entity);
    }

    public void eliminar(Long cedula) {
        Usuario entity = getEntity(cedula);
        if ("admininicial".equalsIgnoreCase(entity.getUsuario())) {
            throw new BusinessException("No se recomienda borrar el usuario admininicial. Puede desactivarlo.");
        }
        usuarioRepository.delete(entity);
    }

    public UsuarioResponse desactivarAdminInicial() {
        Usuario admin = usuarioRepository.findByUsuarioIgnoreCaseAndActivoTrue("admininicial")
                .orElseThrow(() -> new NotFoundException("Usuario admininicial no encontrado o ya está inactivo"));
        admin.setActivo(false);
        usuarioRepository.save(admin);
        return toResponse(admin);
    }

    public Usuario getEntity(Long cedula) {
        return usuarioRepository.findById(cedula)
                .orElseThrow(() -> new NotFoundException("Usuario inexistente"));
    }

    private void map(UsuarioRequest req, Usuario entity, boolean create) {
        String nombreCompleto = InputSanitizer.normalize(req.getNombreCompleto());
        String correoElectronico = InputSanitizer.normalizeLowerCase(req.getCorreoElectronico());
        String usuario = InputSanitizer.normalizeLowerCase(req.getUsuario());
        String contrasena = InputSanitizer.normalize(req.getContrasena());

        validateUniqueness(entity.getCedula(), correoElectronico, usuario, create);
        validatePassword(contrasena, create);

        if (create) {
            entity.setCedula(req.getCedula());
        }

        entity.setNombreCompleto(nombreCompleto);
        entity.setCorreoElectronico(correoElectronico);
        entity.setUsuario(usuario);
        if (StringUtils.hasText(contrasena)) {
            entity.setContrasena(passwordEncoder.encode(contrasena));
        }
        entity.setActivo(req.getActivo() == null ? true : req.getActivo());
    }

    private void validateUniqueness(Long cedula, String correoElectronico, String usuario, boolean create) {
        boolean usernameExists = create
                ? usuarioRepository.existsByUsuarioIgnoreCase(usuario)
                : usuarioRepository.existsByUsuarioIgnoreCaseAndCedulaNot(usuario, cedula);
        if (usernameExists) {
            throw new BusinessException("Ya existe un usuario con ese nombre de usuario");
        }

        boolean emailExists = create
                ? usuarioRepository.existsByCorreoElectronicoIgnoreCase(correoElectronico)
                : usuarioRepository.existsByCorreoElectronicoIgnoreCaseAndCedulaNot(correoElectronico, cedula);
        if (emailExists) {
            throw new BusinessException("Ya existe un usuario con ese correo electrónico");
        }
    }

    private void validatePassword(String contrasena, boolean create) {
        if (!StringUtils.hasText(contrasena)) {
            if (create) {
                throw new BusinessException("La contraseña es obligatoria para crear usuarios");
            }
            return;
        }

        if (contrasena.length() < PASSWORD_MIN_LENGTH) {
            throw new BusinessException("La contraseña debe tener al menos 8 caracteres");
        }
    }

    private void validateIdentifierMatch(Long pathId, Long requestId, String field) {
        if (requestId == null || !pathId.equals(requestId)) {
            throw new BusinessException("La " + field + " del cuerpo no coincide con la URL");
        }
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(
                u.getCedula(),
                u.getNombreCompleto(),
                u.getCorreoElectronico(),
                u.getUsuario(),
                u.getActivo());
    }
}
