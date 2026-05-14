package com.tiendagenerica.api.dto.auth;

import java.time.Instant;

public class LoginResponse {
    private Long cedula;
    private String nombreCompleto;
    private String usuario;
    private String token;
    private String tipoToken;
    private Instant expiraEn;
    private String mensaje;

    public LoginResponse() {
    }

    public LoginResponse(
            Long cedula,
            String nombreCompleto,
            String usuario,
            String token,
            String tipoToken,
            Instant expiraEn,
            String mensaje) {
        this.cedula = cedula;
        this.nombreCompleto = nombreCompleto;
        this.usuario = usuario;
        this.token = token;
        this.tipoToken = tipoToken;
        this.expiraEn = expiraEn;
        this.mensaje = mensaje;
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

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipoToken() {
        return tipoToken;
    }

    public void setTipoToken(String tipoToken) {
        this.tipoToken = tipoToken;
    }

    public Instant getExpiraEn() {
        return expiraEn;
    }

    public void setExpiraEn(Instant expiraEn) {
        this.expiraEn = expiraEn;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
