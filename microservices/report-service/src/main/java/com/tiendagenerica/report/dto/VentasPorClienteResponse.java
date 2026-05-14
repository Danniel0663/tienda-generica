package com.tiendagenerica.report.dto;

import java.math.BigDecimal;

public class VentasPorClienteResponse {

    private Long cedulaCliente;
    private String nombreCliente;
    private BigDecimal totalCompras;

    public VentasPorClienteResponse(Long cedulaCliente, String nombreCliente, BigDecimal totalCompras) {
        this.cedulaCliente = cedulaCliente;
        this.nombreCliente = nombreCliente;
        this.totalCompras = totalCompras;
    }

    public Long getCedulaCliente() {
        return cedulaCliente;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public BigDecimal getTotalCompras() {
        return totalCompras;
    }
}
