package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.proveedor.ProveedorRequest;
import com.tiendagenerica.api.dto.proveedor.ProveedorResponse;
import com.tiendagenerica.api.entity.Proveedor;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.exception.NotFoundException;
import com.tiendagenerica.api.repository.ProveedorRepository;
import com.tiendagenerica.api.util.InputSanitizer;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProveedorService {
    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    public ProveedorResponse crear(ProveedorRequest req) {
        if (proveedorRepository.existsById(req.getNit())) {
            throw new BusinessException("Ya existe un proveedor con ese NIT");
        }
        Proveedor p = new Proveedor();
        map(req, p, true);
        return toResponse(proveedorRepository.save(p));
    }

    public ProveedorResponse obtener(Long nit) {
        return toResponse(getEntity(nit));
    }

    public List<ProveedorResponse> listar() {
        return proveedorRepository.findAll(Sort.by(Sort.Direction.ASC, "nombreProveedor")).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProveedorResponse actualizar(Long nit, ProveedorRequest req) {
        validateIdentifierMatch(nit, req.getNit(), "NIT del proveedor");
        Proveedor p = getEntity(nit);
        map(req, p, false);
        return toResponse(proveedorRepository.save(p));
    }

    public void eliminar(Long nit) {
        proveedorRepository.delete(getEntity(nit));
    }

    public Proveedor getEntity(Long nit) {
        return proveedorRepository.findById(nit)
                .orElseThrow(() -> new NotFoundException("Proveedor inexistente"));
    }

    private void map(ProveedorRequest req, Proveedor p, boolean create) {
        if (create) {
            p.setNit(req.getNit());
        }
        p.setNombreProveedor(InputSanitizer.normalize(req.getNombreProveedor()));
        p.setDireccion(InputSanitizer.normalize(req.getDireccion()));
        p.setTelefono(InputSanitizer.normalize(req.getTelefono()));
        p.setCiudad(InputSanitizer.normalize(req.getCiudad()));
    }

    private void validateIdentifierMatch(Long pathId, Long requestId, String field) {
        if (requestId == null || !pathId.equals(requestId)) {
            throw new BusinessException("El " + field + " del cuerpo no coincide con la URL");
        }
    }

    private ProveedorResponse toResponse(Proveedor p) {
        return new ProveedorResponse(
                p.getNit(),
                p.getNombreProveedor(),
                p.getDireccion(),
                p.getTelefono(),
                p.getCiudad());
    }
}
