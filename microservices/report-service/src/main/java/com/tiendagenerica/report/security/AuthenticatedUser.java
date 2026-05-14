package com.tiendagenerica.report.security;

public record AuthenticatedUser(Long cedula, String usuario, String nombreCompleto) {
}
