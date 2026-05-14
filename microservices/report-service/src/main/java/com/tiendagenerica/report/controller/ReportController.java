package com.tiendagenerica.report.controller;

import com.tiendagenerica.report.dto.ClienteResponse;
import com.tiendagenerica.report.dto.UsuarioResponse;
import com.tiendagenerica.report.dto.VentasPorClienteReportResponse;
import com.tiendagenerica.report.dto.VentasPorClienteResponse;
import com.tiendagenerica.report.service.ReportQueryService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
public class ReportController {

    private final ReportQueryService reportQueryService;

    public ReportController(ReportQueryService reportQueryService) {
        this.reportQueryService = reportQueryService;
    }

    @GetMapping("/usuarios")
    public List<UsuarioResponse> listadoUsuarios() {
        return reportQueryService.listarUsuarios();
    }

    @GetMapping("/clientes")
    public List<ClienteResponse> listadoClientes() {
        return reportQueryService.listarClientes();
    }

    @GetMapping("/ventas-por-cliente")
    public VentasPorClienteReportResponse ventasPorCliente() {
        List<VentasPorClienteResponse> detalle = reportQueryService.listarVentasPorCliente();
        BigDecimal total = reportQueryService.totalConsolidadoVentas(detalle);
        return new VentasPorClienteReportResponse(detalle, total);
    }
}
