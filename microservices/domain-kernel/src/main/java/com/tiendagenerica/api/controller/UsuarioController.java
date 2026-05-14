package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.common.ApiResponse;
import com.tiendagenerica.api.dto.usuario.UsuarioRequest;
import com.tiendagenerica.api.dto.usuario.UsuarioResponse;
import com.tiendagenerica.api.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest request) {
        return usuarioService.crear(request);
    }

    @GetMapping("/{cedula}")
    public UsuarioResponse obtener(@PathVariable @Positive Long cedula) {
        return usuarioService.obtenerPorCedula(cedula);
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @PutMapping("/{cedula}")
    public UsuarioResponse actualizar(@PathVariable @Positive Long cedula, @Valid @RequestBody UsuarioRequest request) {
        return usuarioService.actualizar(cedula, request);
    }

    @DeleteMapping("/{cedula}")
    public ApiResponse eliminar(@PathVariable @Positive Long cedula) {
        usuarioService.eliminar(cedula);
        return new ApiResponse("Datos del Usuario Borrados");
    }

    @PatchMapping("/admininicial/desactivar")
    public UsuarioResponse desactivarAdminInicial() {
        return usuarioService.desactivarAdminInicial();
    }
}
