package com.tiendagenerica.api.dto.venta;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class DetalleVentaItemRequest {

    @NotNull
    @Positive
    private Long codigoProducto;

    @NotNull
    @Min(1)
    private Integer cantidad;

    public Long getCodigoProducto() {
        return codigoProducto;
    }

    public void setCodigoProducto(Long codigoProducto) {
        this.codigoProducto = codigoProducto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
