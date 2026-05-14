package com.tiendagenerica.api.repository;

import com.tiendagenerica.api.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}