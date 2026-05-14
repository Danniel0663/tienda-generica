package com.tiendagenerica.api.dto.venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VentaResumenResponse {
    private Long codigoVenta;
    private Long cedulaCliente;
    private String nombreCliente;
    private Long cedulaUsuario;
    private String nombreUsuario;
    private BigDecimal valorTotalVenta;
    private BigDecimal valorIva;
    private BigDecimal valorTotalConIva;
    private LocalDateTime fechaVenta;

    public VentaResumenResponse() {
    }

    public VentaResumenResponse(
            Long codigoVenta,
            Long cedulaCliente,
            String nombreCliente,
            Long cedulaUsuario,
            String nombreUsuario,
            BigDecimal valorTotalVenta,
            BigDecimal valorIva,
            BigDecimal valorTotalConIva,
            LocalDateTime fechaVenta) {
        this.codigoVenta = codigoVenta;
        this.cedulaCliente = cedulaCliente;
        this.nombreCliente = nombreCliente;
        this.cedulaUsuario = cedulaUsuario;
        this.nombreUsuario = nombreUsuario;
        this.valorTotalVenta = valorTotalVenta;
        this.valorIva = valorIva;
        this.valorTotalConIva = valorTotalConIva;
        this.fechaVenta = fechaVenta;
    }

    public Long getCodigoVenta() {
        return codigoVenta;
    }

    public void setCodigoVenta(Long codigoVenta) {
        this.codigoVenta = codigoVenta;
    }

    public Long getCedulaCliente() {
        return cedulaCliente;
    }

    public void setCedulaCliente(Long cedulaCliente) {
        this.cedulaCliente = cedulaCliente;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public Long getCedulaUsuario() {
        return cedulaUsuario;
    }

    public void setCedulaUsuario(Long cedulaUsuario) {
        this.cedulaUsuario = cedulaUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public BigDecimal getValorTotalVenta() {
        return valorTotalVenta;
    }

    public void setValorTotalVenta(BigDecimal valorTotalVenta) {
        this.valorTotalVenta = valorTotalVenta;
    }

    public BigDecimal getValorIva() {
        return valorIva;
    }

    public void setValorIva(BigDecimal valorIva) {
        this.valorIva = valorIva;
    }

    public BigDecimal getValorTotalConIva() {
        return valorTotalConIva;
    }

    public void setValorTotalConIva(BigDecimal valorTotalConIva) {
        this.valorTotalConIva = valorTotalConIva;
    }

    public LocalDateTime getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDateTime fechaVenta) {
        this.fechaVenta = fechaVenta;
    }
}
