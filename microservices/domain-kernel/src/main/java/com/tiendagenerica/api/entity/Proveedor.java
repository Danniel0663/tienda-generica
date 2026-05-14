package com.tiendagenerica.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "proveedores")
public class Proveedor {

    @Id
    @Column(name = "nit")
    private Long nit;

    @Column(name = "nombre_proveedor", nullable = false, length = 120)
    private String nombreProveedor;

    @Column(name = "direccion", nullable = false, length = 180)
    private String direccion;

    @Column(name = "telefono", nullable = false, length = 40)
    private String telefono;

    @Column(name = "ciudad", nullable = false, length = 80)
    private String ciudad;

    public Long getNit() {
        return nit;
    }

    public void setNit(Long nit) {
        this.nit = nit;
    }

    public String getNombreProveedor() {
        return nombreProveedor;
    }

    public void setNombreProveedor(String nombreProveedor) {
        this.nombreProveedor = nombreProveedor;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
}