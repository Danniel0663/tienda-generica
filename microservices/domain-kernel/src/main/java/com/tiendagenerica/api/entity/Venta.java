package com.tiendagenerica.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_venta")
    private Long codigoVenta;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cedula_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cedula_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "valor_total_venta", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorTotalVenta;

    @Column(name = "valor_iva", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorIva;

    @Column(name = "valor_total_con_iva", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorTotalConIva;

    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fechaVenta = LocalDateTime.now();

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleVenta> detalles = new ArrayList<>();

    public Long getCodigoVenta() {
        return codigoVenta;
    }

    public void setCodigoVenta(Long codigoVenta) {
        this.codigoVenta = codigoVenta;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public BigDecimal getValorTotalVenta() {
        return valorTotalVenta;
    }

    public void setValorTotalVenta(BigDecimal valorTotalVenta) {
        this.valorTotalVenta = valorTotalVenta;
    }

    public BigDecimal getValorIva() {
        return valorIva;
    }

    public void setValorIva(BigDecimal valorIva) {
        this.valorIva = valorIva;
    }

    public BigDecimal getValorTotalConIva() {
        return valorTotalConIva;
    }

    public void setValorTotalConIva(BigDecimal valorTotalConIva) {
        this.valorTotalConIva = valorTotalConIva;
    }

    public LocalDateTime getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDateTime fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public List<DetalleVenta> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVenta> detalles) {
        this.detalles = detalles;
    }
}