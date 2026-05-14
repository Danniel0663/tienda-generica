package com.tiendagenerica.api.dto.venta;

import java.math.BigDecimal;

public class DetalleVentaItemResponse {
    private Long codigoProducto;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal valorUnitario;
    private BigDecimal valorTotal;
    private BigDecimal ivaLinea;

    public DetalleVentaItemResponse() {
    }

    public DetalleVentaItemResponse(Long codigoProducto, String nombreProducto, Integer cantidad,
            BigDecimal valorUnitario, BigDecimal valorTotal, BigDecimal ivaLinea) {
        this.codigoProducto = codigoProducto;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.valorUnitario = valorUnitario;
        this.valorTotal = valorTotal;
        this.ivaLinea = ivaLinea;
    }

    public Long getCodigoProducto() {
        return codigoProducto;
    }

    public void setCodigoProducto(Long codigoProducto) {
        this.codigoProducto = codigoProducto;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public BigDecimal getIvaLinea() {
        return ivaLinea;
    }

    public void setIvaLinea(BigDecimal ivaLinea) {
        this.ivaLinea = ivaLinea;
    }
}