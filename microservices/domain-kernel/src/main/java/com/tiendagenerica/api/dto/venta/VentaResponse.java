package com.tiendagenerica.api.dto.venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class VentaResponse {
    private Long codigoVenta;
    private Long cedulaCliente;
    private String nombreCliente;
    private Long cedulaUsuario;
    private String nombreUsuario;
    private BigDecimal valorTotalVenta;
    private BigDecimal valorIva;
    private BigDecimal valorTotalConIva;
    private LocalDateTime fechaVenta;
    private List<DetalleVentaItemResponse> detalles;
    private String mensaje;

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

    public List<DetalleVentaItemResponse> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaItemResponse> detalles) {
        this.detalles = detalles;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}