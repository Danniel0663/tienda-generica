package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.producto.ProductoRequest;
import com.tiendagenerica.api.dto.producto.ProductoResponse;
import com.tiendagenerica.api.entity.Producto;
import com.tiendagenerica.api.entity.Proveedor;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.exception.NotFoundException;
import com.tiendagenerica.api.repository.ProductoRepository;
import com.tiendagenerica.api.repository.ProveedorRepository;
import com.tiendagenerica.api.util.InputSanitizer;
import jakarta.transaction.Transactional;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;

    public ProductoService(ProductoRepository productoRepository, ProveedorRepository proveedorRepository) {
        this.productoRepository = productoRepository;
        this.proveedorRepository = proveedorRepository;
    }

    public ProductoResponse crear(ProductoRequest req) {
        if (productoRepository.existsById(req.getCodigoProducto())) {
            throw new BusinessException("Ya existe un producto con ese código");
        }
        Producto p = new Producto();
        map(req, p, true);
        return toResponse(productoRepository.save(p));
    }

    public ProductoResponse obtener(Long codigo) {
        return toResponse(getEntity(codigo));
    }

    public List<ProductoResponse> listar() {
        return productoRepository.findAll(Sort.by(Sort.Direction.ASC, "nombreProducto")).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductoResponse actualizar(Long codigo, ProductoRequest req) {
        validateIdentifierMatch(codigo, req.getCodigoProducto(), "código del producto");
        Producto p = getEntity(codigo);
        map(req, p, false);
        return toResponse(productoRepository.save(p));
    }

    public void eliminar(Long codigo) {
        productoRepository.delete(getEntity(codigo));
    }

    @Transactional
    public List<ProductoResponse> cargarCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Debe seleccionar un archivo CSV con productos");
        }

        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!name.endsWith(".csv")) {
            throw new BusinessException("El archivo debe tener extensión .csv");
        }

        List<Producto> productos = new ArrayList<>();
        Set<Long> codesInFile = new HashSet<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            while ((line = br.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }

                if (lineNumber == 1 && looksLikeHeader(line)) {
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length != 6) {
                    throw new BusinessException("Formato CSV inválido en la línea " + lineNumber);
                }

                try {
                    Long codigo = Long.parseLong(parts[0].trim());
                    if (!codesInFile.add(codigo)) {
                        throw new BusinessException("El código " + codigo + " está repetido en el CSV");
                    }

                    String nombre = InputSanitizer.normalize(parts[1]);
                    Long nitProveedor = Long.parseLong(parts[2].trim());
                    BigDecimal precioCompra = new BigDecimal(parts[3].trim());
                    BigDecimal ivaCompra = new BigDecimal(parts[4].trim());
                    BigDecimal precioVenta = new BigDecimal(parts[5].trim());

                    Proveedor proveedor = proveedorRepository.findById(nitProveedor)
                            .orElseThrow(() -> new BusinessException(
                                    "El proveedor con NIT " + nitProveedor + " no existe"));

                    Producto producto = productoRepository.findById(codigo).orElseGet(Producto::new);
                    producto.setCodigoProducto(codigo);
                    producto.setNombreProducto(nombre);
                    producto.setProveedor(proveedor);
                    producto.setPrecioCompra(precioCompra);
                    producto.setIvaCompra(ivaCompra);
                    producto.setPrecioVenta(precioVenta);
                    validateBusinessRules(producto);
                    productos.add(producto);
                } catch (NumberFormatException ex) {
                    throw new BusinessException("Datos numéricos inválidos en la línea " + lineNumber);
                }
            }
        } catch (IOException ex) {
            throw new BusinessException("No fue posible leer el archivo: " + ex.getMessage());
        }

        if (productos.isEmpty()) {
            throw new BusinessException("El archivo CSV no contiene productos válidos");
        }

        productoRepository.saveAll(productos);
        return listar();
    }

    public Producto getEntity(Long codigo) {
        return productoRepository.findById(codigo)
                .orElseThrow(() -> new NotFoundException("Producto inexistente"));
    }

    private void map(ProductoRequest req, Producto p, boolean create) {
        if (create) {
            p.setCodigoProducto(req.getCodigoProducto());
        }
        Proveedor proveedor = proveedorRepository.findById(req.getNitProveedor())
                .orElseThrow(() -> new NotFoundException("Proveedor inexistente para el NIT indicado"));
        p.setNombreProducto(InputSanitizer.normalize(req.getNombreProducto()));
        p.setProveedor(proveedor);
        p.setPrecioCompra(req.getPrecioCompra());
        p.setIvaCompra(req.getIvaCompra());
        p.setPrecioVenta(req.getPrecioVenta());
        validateBusinessRules(p);
    }

    private void validateBusinessRules(Producto producto) {
        if (producto.getPrecioVenta().compareTo(producto.getPrecioCompra()) < 0) {
            throw new BusinessException("El precio de venta no puede ser menor al precio de compra");
        }
        if (producto.getIvaCompra().compareTo(BigDecimal.ZERO) < 0
                || producto.getIvaCompra().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("El IVA debe estar entre 0 y 100");
        }
    }

    private boolean looksLikeHeader(String line) {
        return line.toLowerCase().contains("codigoproducto")
                || line.toLowerCase().contains("codigo_producto");
    }

    private void validateIdentifierMatch(Long pathId, Long requestId, String field) {
        if (requestId == null || !pathId.equals(requestId)) {
            throw new BusinessException("El " + field + " del cuerpo no coincide con la URL");
        }
    }

    private ProductoResponse toResponse(Producto p) {
        return new ProductoResponse(
                p.getCodigoProducto(),
                p.getNombreProducto(),
                p.getProveedor().getNit(),
                p.getProveedor().getNombreProveedor(),
                p.getPrecioCompra(),
                p.getIvaCompra(),
                p.getPrecioVenta());
    }
}
