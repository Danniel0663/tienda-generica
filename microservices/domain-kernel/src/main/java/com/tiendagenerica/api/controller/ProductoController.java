package com.tiendagenerica.api.controller;

import com.tiendagenerica.api.dto.common.ApiResponse;
import com.tiendagenerica.api.dto.producto.ProductoRequest;
import com.tiendagenerica.api.dto.producto.ProductoResponse;
import com.tiendagenerica.api.service.ProductoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest request) {
        return productoService.crear(request);
    }

    @GetMapping("/{codigo}")
    public ProductoResponse obtener(@PathVariable @Positive Long codigo) {
        return productoService.obtener(codigo);
    }

    @GetMapping
    public List<ProductoResponse> listar() {
        return productoService.listar();
    }

    @PutMapping("/{codigo}")
    public ProductoResponse actualizar(@PathVariable @Positive Long codigo, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(codigo, request);
    }

    @DeleteMapping("/{codigo}")
    public ApiResponse eliminar(@PathVariable @Positive Long codigo) {
        productoService.eliminar(codigo);
        return new ApiResponse("Producto eliminado");
    }

    @PostMapping(value = "/cargar-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<ProductoResponse> cargarCsv(@RequestParam("archivo") MultipartFile archivo) {
        return productoService.cargarCsv(archivo);
    }
}
