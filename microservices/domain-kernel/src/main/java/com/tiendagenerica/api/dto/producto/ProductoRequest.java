package com.tiendagenerica.api.dto.producto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class ProductoRequest {
    @NotNull
    @Positive
    private Long codigoProducto;
    @NotBlank
    @jakarta.validation.constraints.Size(min = 3, max = 80)
    private String nombreProducto;
    @NotNull
    @Positive
    private Long nitProveedor;
    @NotNull
    @DecimalMin("0.01")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal precioCompra;
    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    @Digits(integer = 5, fraction = 2)
    private BigDecimal ivaCompra;
    @NotNull
    @DecimalMin("0.01")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal precioVenta;

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
