package com.tiendagenerica.api.dto.proveedor;

public class ProveedorResponse {
    private Long nit;
    private String nombreProveedor;
    private String direccion;
    private String telefono;
    private String ciudad;

    public ProveedorResponse() {
    }

    public ProveedorResponse(Long nit, String nombreProveedor, String direccion, String telefono, String ciudad) {
        this.nit = nit;
        this.nombreProveedor = nombreProveedor;
        this.direccion = direccion;
        this.telefono = telefono;
        this.ciudad = ciudad;
    }

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