package com.tiendagenerica.report.dto;

import java.math.BigDecimal;
import java.util.List;

public class VentasPorClienteReportResponse {
    private List<VentasPorClienteResponse> detalle;
    private BigDecimal totalConsolidado;

    public VentasPorClienteReportResponse() {
    }

    public VentasPorClienteReportResponse(List<VentasPorClienteResponse> detalle, BigDecimal totalConsolidado) {
        this.detalle = detalle;
        this.totalConsolidado = totalConsolidado;
    }

    public List<VentasPorClienteResponse> getDetalle() {
        return detalle;
    }

    public void setDetalle(List<VentasPorClienteResponse> detalle) {
        this.detalle = detalle;
    }

    public BigDecimal getTotalConsolidado() {
        return totalConsolidado;
    }

    public void setTotalConsolidado(BigDecimal totalConsolidado) {
        this.totalConsolidado = totalConsolidado;
    }
}
