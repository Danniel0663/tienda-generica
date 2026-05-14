package com.tiendagenerica.api.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ClienteRequest {
    @NotNull
    @Positive
    private Long cedula;
    @NotBlank
    @Size(min = 3, max = 120)
    private String nombreCompleto;
    @NotBlank
    @Size(min = 8, max = 180)
    private String direccion;
    @NotBlank
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$")
    @Size(max = 40)
    private String telefono;
    @NotBlank
    @Email
    @Size(max = 120)
    private String correoElectronico;

    public Long getCedula() {
        return cedula;
    }

    public void setCedula(Long cedula) {
        this.cedula = cedula;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
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

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }
}
