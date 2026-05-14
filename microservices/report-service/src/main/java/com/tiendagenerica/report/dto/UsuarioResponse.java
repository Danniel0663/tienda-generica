package com.tiendagenerica.report.dto;

public class UsuarioResponse {

    private Long cedula;
    private String nombreCompleto;
    private String correoElectronico;
    private String usuario;
    private Boolean activo;

    public UsuarioResponse(Long cedula, String nombreCompleto, String correoElectronico, String usuario, Boolean activo) {
        this.cedula = cedula;
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.usuario = usuario;
        this.activo = activo;
    }

    public Long getCedula() {
        return cedula;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public String getUsuario() {
        return usuario;
    }

    public Boolean getActivo() {
        return activo;
    }
}
