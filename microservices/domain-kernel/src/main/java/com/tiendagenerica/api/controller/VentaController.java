package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.venta.CrearVentaRequest;
import com.tiendagenerica.api.dto.venta.VentaResponse;
import com.tiendagenerica.api.dto.venta.VentaResumenResponse;
import com.tiendagenerica.api.service.VentaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public VentaResponse crear(@Valid @RequestBody CrearVentaRequest request) {
        return ventaService.crearVenta(request);
    }

    @GetMapping
    public List<VentaResumenResponse> listar() {
        return ventaService.listarVentas();
    }
}
