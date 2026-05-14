package com.tiendagenerica.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.tiendagenerica.api.dto.venta.CrearVentaRequest;
import com.tiendagenerica.api.dto.venta.DetalleVentaItemRequest;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.repository.VentaRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class VentaServiceTest {

    @Test
    void crearVentaDebeRechazarProductosDuplicados() {
        VentaService ventaService = new VentaService(
                Mockito.mock(VentaRepository.class),
                Mockito.mock(ClienteService.class),
                Mockito.mock(UsuarioService.class),
                Mockito.mock(ProductoService.class));

        CrearVentaRequest request = new CrearVentaRequest();
        request.setCedulaCliente(10L);
        request.setCedulaUsuario(20L);
        request.setItems(List.of(item(501L, 1), item(501L, 2)));

        assertThrows(BusinessException.class, () -> ventaService.crearVenta(request));
    }

    private DetalleVentaItemRequest item(Long codigoProducto, int cantidad) {
        DetalleVentaItemRequest item = new DetalleVentaItemRequest();
        item.setCodigoProducto(codigoProducto);
        item.setCantidad(cantidad);
        return item;
    }
}
