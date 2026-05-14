package com.tiendagenerica.api.dto.producto;

import java.math.BigDecimal;

public class ProductoResponse {
    private Long codigoProducto;
    private String nombreProducto;
    private Long nitProveedor;
    private String nombreProveedor;
    private BigDecimal precioCompra;
    private BigDecimal ivaCompra;
    private BigDecimal precioVenta;

    public ProductoResponse() {
    }

    public ProductoResponse(Long codigoProducto, String nombreProducto, Long nitProveedor, String nombreProveedor,
            BigDecimal precioCompra, BigDecimal ivaCompra, BigDecimal precioVenta) {
        this.codigoProducto = codigoProducto;
        this.nombreProducto = nombreProducto;
        this.nitProveedor = nitProveedor;
        this.nombreProveedor = nombreProveedor;
        this.precioCompra = precioCompra;
        this.ivaCompra = ivaCompra;
        this.precioVenta = precioVenta;
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

    public Long getNitProveedor() {
        return nitProveedor;
    }

    public void setNitProveedor(Long nitProveedor) {
        this.nitProveedor = nitProveedor;
    }

    public String getNombreProveedor() {
        return nombreProveedor;
    }

    public void setNombreProveedor(String nombreProveedor) {
        this.nombreProveedor = nombreProveedor;
    }

    public BigDecimal getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(BigDecimal precioCompra) {
        this.precioCompra = precioCompra;
    }

    public BigDecimal getIvaCompra() {
        return ivaCompra;
    }

    public void setIvaCompra(BigDecimal ivaCompra) {
        this.ivaCompra = ivaCompra;
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }
}