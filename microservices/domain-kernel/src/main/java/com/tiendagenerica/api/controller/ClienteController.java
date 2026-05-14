package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.cliente.ClienteRequest;
import com.tiendagenerica.api.dto.cliente.ClienteResponse;
import com.tiendagenerica.api.dto.common.ApiResponse;
import com.tiendagenerica.api.service.ClienteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ClienteResponse crear(@Valid @RequestBody ClienteRequest request) {
        return clienteService.crear(request);
    }

    @GetMapping("/{cedula}")
    public ClienteResponse obtener(@PathVariable @Positive Long cedula) {
        return clienteService.obtener(cedula);
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return clienteService.listar();
    }

    @PutMapping("/{cedula}")
    public ClienteResponse actualizar(@PathVariable @Positive Long cedula, @Valid @RequestBody ClienteRequest request) {
        return clienteService.actualizar(cedula, request);
    }

    @DeleteMapping("/{cedula}")
    public ApiResponse eliminar(@PathVariable @Positive Long cedula) {
        clienteService.eliminar(cedula);
        return new ApiResponse("Datos del Cliente Borrados");

    }
}
