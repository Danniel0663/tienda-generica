package com.tiendagenerica.api.repository;

import com.tiendagenerica.api.entity.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuarioIgnoreCaseAndActivoTrue(String usuario);

    boolean existsByUsuarioIgnoreCase(String usuario);

    boolean existsByUsuarioIgnoreCaseAndCedulaNot(String usuario, Long cedula);

    boolean existsByCorreoElectronicoIgnoreCase(String correoElectronico);

    boolean existsByCorreoElectronicoIgnoreCaseAndCedulaNot(String correoElectronico, Long cedula);
}
