package com.tiendagenerica.api.dto.proveedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ProveedorRequest {
    @NotNull
    @Positive
    private Long nit;
    @NotBlank
    @Size(min = 3, max = 120)
    private String nombreProveedor;
    @NotBlank
    @Size(min = 8, max = 180)
    private String direccion;
    @NotBlank
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$")
    @Size(max = 40)
    private String telefono;
    @NotBlank
    @Size(min = 2, max = 80)
    private String ciudad;

    public Long getNit() {
        return nit;
    }

    public void setNit(Long nit) {
        this.nit = nit;
    }

    public String getNombreProveedor() {
        return nombreProveedor;
    }

    public void setNombreProveedor(String nombreProveedor) {
        this.nombreProveedor = nombreProveedor;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
}
