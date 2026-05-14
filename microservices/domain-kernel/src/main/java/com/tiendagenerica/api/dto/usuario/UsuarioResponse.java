package com.tiendagenerica.api.dto.usuario;

public class UsuarioResponse {
    private Long cedula;
    private String nombreCompleto;
    private String correoElectronico;
    private String usuario;
    private Boolean activo;

    public UsuarioResponse() {
    }

    public UsuarioResponse(Long cedula, String nombreCompleto, String correoElectronico, String usuario,
            Boolean activo) {
        this.cedula = cedula;
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.usuario = usuario;
        this.activo = activo;
    }

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

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}