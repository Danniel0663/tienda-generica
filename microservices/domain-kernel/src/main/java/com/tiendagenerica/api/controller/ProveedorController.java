package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.common.ApiResponse;
import com.tiendagenerica.api.dto.proveedor.ProveedorRequest;
import com.tiendagenerica.api.dto.proveedor.ProveedorResponse;
import com.tiendagenerica.api.service.ProveedorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @PostMapping
    public ProveedorResponse crear(@Valid @RequestBody ProveedorRequest request) {
        return proveedorService.crear(request);
    }

    @GetMapping("/{nit}")
    public ProveedorResponse obtener(@PathVariable @Positive Long nit) {
        return proveedorService.obtener(nit);
    }

    @GetMapping
    public List<ProveedorResponse> listar() {
        return proveedorService.listar();
    }

    @PutMapping("/{nit}")
    public ProveedorResponse actualizar(@PathVariable @Positive Long nit, @Valid @RequestBody ProveedorRequest request) {
        return proveedorService.actualizar(nit, request);
    }

    @DeleteMapping("/{nit}")
    public ApiResponse eliminar(@PathVariable @Positive Long nit) {
        proveedorService.eliminar(nit);
        return new ApiResponse("Datos del Proveedor Borrados");
    }
}
