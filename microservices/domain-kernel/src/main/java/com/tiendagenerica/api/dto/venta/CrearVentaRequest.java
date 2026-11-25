package com.tiendagenerica.api.dto.venta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public class CrearVentaRequest {

    @NotNull
    @Positive
    private Long cedulaCliente;

    @NotNull
    @Positive
    private Long cedulaUsuario;

    @NotEmpty
    @Valid
    private List<DetalleVentaItemRequest> items;

    public Long getCedulaCliente() {
        return cedulaCliente;
    }

    public void setCedulaCliente(Long cedulaCliente) {
        this.cedulaCliente = cedulaCliente;
    }

    public Long getCedulaUsuario() {
        return cedulaUsuario;
    }

    public void setCedulaUsuario(Long cedulaUsuario) {
        this.cedulaUsuario = cedulaUsuario;
    }

    public List<DetalleVentaItemRequest> getItems() {
        return items;
    }

    public void setItems(List<DetalleVentaItemRequest> items) {
        this.items = items;
    }
}
