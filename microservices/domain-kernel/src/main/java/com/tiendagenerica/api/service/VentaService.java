package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.venta.CrearVentaRequest;
import com.tiendagenerica.api.dto.venta.DetalleVentaItemRequest;
import com.tiendagenerica.api.dto.venta.DetalleVentaItemResponse;
import com.tiendagenerica.api.dto.venta.VentaResponse;
import com.tiendagenerica.api.dto.venta.VentaResumenResponse;
import com.tiendagenerica.api.entity.Cliente;
import com.tiendagenerica.api.entity.DetalleVenta;
import com.tiendagenerica.api.entity.Producto;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.entity.Venta;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.repository.VentaRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteService clienteService;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;

    public VentaService(
            VentaRepository ventaRepository,
            ClienteService clienteService,
            UsuarioService usuarioService,
            ProductoService productoService) {
        this.ventaRepository = ventaRepository;
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
    }

    @Transactional
    public VentaResponse crearVenta(CrearVentaRequest req) {
        if (req.getItems().size() > 3) {
            throw new BusinessException("Solo se permiten hasta 3 productos por venta según el requerimiento");
        }

        validateUniqueProducts(req.getItems());

        Cliente cliente = clienteService.getEntity(req.getCedulaCliente());
        Usuario usuario = usuarioService.getEntity(req.getCedulaUsuario());
        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new BusinessException("El usuario que registra la venta está inactivo");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalIva = BigDecimal.ZERO;
        List<DetalleVentaItemResponse> detalleResponse = new ArrayList<>();

        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setUsuario(usuario);

        for (DetalleVentaItemRequest itemReq : req.getItems()) {
            if (itemReq.getCantidad() == null || itemReq.getCantidad() <= 0) {
                throw new BusinessException("Cantidad inválida para el producto " + itemReq.getCodigoProducto());
            }

            Producto producto = productoService.getEntity(itemReq.getCodigoProducto());

            BigDecimal cantidad = BigDecimal.valueOf(itemReq.getCantidad());
            BigDecimal valorUnitario = producto.getPrecioVenta().setScale(2, RoundingMode.HALF_UP);
            BigDecimal valorTotalLinea = valorUnitario.multiply(cantidad).setScale(2, RoundingMode.HALF_UP);

            BigDecimal porcentajeIva = producto.getIvaCompra().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            BigDecimal ivaLinea = valorTotalLinea.multiply(porcentajeIva).setScale(2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(valorTotalLinea);
            totalIva = totalIva.add(ivaLinea);

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(itemReq.getCantidad());
            detalle.setValorUnitario(valorUnitario);
            detalle.setValorTotal(valorTotalLinea);
            venta.getDetalles().add(detalle);

            detalleResponse.add(new DetalleVentaItemResponse(
                    producto.getCodigoProducto(),
                    producto.getNombreProducto(),
                    itemReq.getCantidad(),
                    valorUnitario,
                    valorTotalLinea,
                    ivaLinea));
        }

        venta.setValorTotalVenta(subtotal.setScale(2, RoundingMode.HALF_UP));
        venta.setValorIva(totalIva.setScale(2, RoundingMode.HALF_UP));
        venta.setValorTotalConIva(subtotal.add(totalIva).setScale(2, RoundingMode.HALF_UP));

        Venta saved = ventaRepository.save(venta);

        VentaResponse res = new VentaResponse();
        res.setCodigoVenta(saved.getCodigoVenta());
        res.setCedulaCliente(cliente.getCedula());
        res.setNombreCliente(cliente.getNombreCompleto());
        res.setCedulaUsuario(usuario.getCedula());
        res.setNombreUsuario(usuario.getNombreCompleto());
        res.setValorTotalVenta(saved.getValorTotalVenta());
        res.setValorIva(saved.getValorIva());
        res.setValorTotalConIva(saved.getValorTotalConIva());
        res.setFechaVenta(saved.getFechaVenta());
        res.setDetalles(detalleResponse);
        res.setMensaje("Venta registrada correctamente");
        return res;
    }

    public List<VentaResumenResponse> listarVentas() {
        return ventaRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaVenta")).stream()
                .map(v -> new VentaResumenResponse(
                        v.getCodigoVenta(),
                        v.getCliente().getCedula(),
                        v.getCliente().getNombreCompleto(),
                        v.getUsuario().getCedula(),
                        v.getUsuario().getNombreCompleto(),
                        v.getValorTotalVenta(),
                        v.getValorIva(),
                        v.getValorTotalConIva(),
                        v.getFechaVenta()))
                .toList();
    }

    private void validateUniqueProducts(List<DetalleVentaItemRequest> items) {
        Set<Long> productCodes = new HashSet<>();
        for (DetalleVentaItemRequest item : items) {
            if (!productCodes.add(item.getCodigoProducto())) {
                throw new BusinessException("No puede repetir el mismo producto dentro de una venta");
            }
        }
    }
}
