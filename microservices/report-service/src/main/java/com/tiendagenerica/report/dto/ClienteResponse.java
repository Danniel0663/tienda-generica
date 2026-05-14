package com.tiendagenerica.report.dto;

public class ClienteResponse {

    private Long cedula;
    private String nombreCompleto;
    private String direccion;
    private String telefono;
    private String correoElectronico;

    public ClienteResponse(Long cedula, String nombreCompleto, String direccion, String telefono, String correoElectronico) {
        this.cedula = cedula;
        this.nombreCompleto = nombreCompleto;
        this.direccion = direccion;
        this.telefono = telefono;
        this.correoElectronico = correoElectronico;
    }

    public Long getCedula() {
        return cedula;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }
}
