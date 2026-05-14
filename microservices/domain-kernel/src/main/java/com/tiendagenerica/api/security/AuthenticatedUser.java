package com.tiendagenerica.api.security;

public record AuthenticatedUser(Long cedula, String usuario, String nombreCompleto) {
}
