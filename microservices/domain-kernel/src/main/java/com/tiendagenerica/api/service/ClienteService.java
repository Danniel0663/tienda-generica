package com.tiendagenerica.api.service;

import com.tiendagenerica.api.dto.cliente.ClienteRequest;
import com.tiendagenerica.api.dto.cliente.ClienteResponse;
import com.tiendagenerica.api.entity.Cliente;
import com.tiendagenerica.api.exception.BusinessException;
import com.tiendagenerica.api.exception.NotFoundException;
import com.tiendagenerica.api.repository.ClienteRepository;
import com.tiendagenerica.api.util.InputSanitizer;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {
    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public ClienteResponse crear(ClienteRequest req) {
        if (clienteRepository.existsById(req.getCedula())) {
            throw new BusinessException("Ya existe un cliente con esa cédula");
        }
        validateEmail(req.getCorreoElectronico(), null);

        Cliente c = new Cliente();
        map(req, c, true);
        return toResponse(clienteRepository.save(c));
    }

    public ClienteResponse obtener(Long cedula) {
        return toResponse(getEntity(cedula));
    }

    public List<ClienteResponse> listar() {
        return clienteRepository.findAll(Sort.by(Sort.Direction.ASC, "nombreCompleto")).stream()
                .map(this::toResponse)
                .toList();
    }

    public ClienteResponse actualizar(Long cedula, ClienteRequest req) {
        validateIdentifierMatch(cedula, req.getCedula(), "cédula del cliente");
        validateEmail(req.getCorreoElectronico(), cedula);

        Cliente c = getEntity(cedula);
        map(req, c, false);
        return toResponse(clienteRepository.save(c));
    }

    public void eliminar(Long cedula) {
        clienteRepository.delete(getEntity(cedula));
    }

    public Cliente getEntity(Long cedula) {
        return clienteRepository.findById(cedula)
                .orElseThrow(() -> new NotFoundException("Cliente inexistente"));
    }

    private void map(ClienteRequest req, Cliente c, boolean create) {
        if (create) {
            c.setCedula(req.getCedula());
        }
        c.setNombreCompleto(InputSanitizer.normalize(req.getNombreCompleto()));
        c.setDireccion(InputSanitizer.normalize(req.getDireccion()));
        c.setTelefono(InputSanitizer.normalize(req.getTelefono()));
        c.setCorreoElectronico(InputSanitizer.normalizeLowerCase(req.getCorreoElectronico()));
    }

    private void validateEmail(String correoElectronico, Long currentId) {
        String normalizedEmail = InputSanitizer.normalizeLowerCase(correoElectronico);
        boolean exists = currentId == null
                ? clienteRepository.existsByCorreoElectronicoIgnoreCase(normalizedEmail)
                : clienteRepository.existsByCorreoElectronicoIgnoreCaseAndCedulaNot(normalizedEmail, currentId);
        if (exists) {
            throw new BusinessException("Ya existe un cliente con ese correo electrónico");
        }
    }

    private void validateIdentifierMatch(Long pathId, Long requestId, String field) {
        if (requestId == null || !pathId.equals(requestId)) {
            throw new BusinessException("La " + field + " del cuerpo no coincide con la URL");
        }
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getCedula(),
                c.getNombreCompleto(),
                c.getDireccion(),
                c.getTelefono(),
                c.getCorreoElectronico());
    }
}
