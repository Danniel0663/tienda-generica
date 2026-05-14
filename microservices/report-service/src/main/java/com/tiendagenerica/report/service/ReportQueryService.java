package com.tiendagenerica.report.service;

import com.tiendagenerica.report.dto.ClienteResponse;
import com.tiendagenerica.report.dto.UsuarioResponse;
import com.tiendagenerica.report.dto.VentasPorClienteResponse;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ReportQueryService {

    private final JdbcTemplate jdbcTemplate;

    public ReportQueryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Reporte de usuarios para vista administrativa del sprint 5.
    public List<UsuarioResponse> listarUsuarios() {
        String sql = """
                select cedula, nombre_completo, correo_electronico, usuario, activo
                from usuarios
                order by nombre_completo asc
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new UsuarioResponse(
                rs.getLong("cedula"),
                rs.getString("nombre_completo"),
                rs.getString("correo_electronico"),
                rs.getString("usuario"),
                rs.getBoolean("activo")));
    }

    // Reporte de clientes para consulta por pantalla.
    public List<ClienteResponse> listarClientes() {
        String sql = """
                select cedula, nombre_completo, direccion, telefono, correo_electronico
                from clientes
                order by nombre_completo asc
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new ClienteResponse(
                rs.getLong("cedula"),
                rs.getString("nombre_completo"),
                rs.getString("direccion"),
                rs.getString("telefono"),
                rs.getString("correo_electronico")));
    }

    // Total de ventas por cliente, incluyendo clientes sin ventas.
    public List<VentasPorClienteResponse> listarVentasPorCliente() {
        String sql = """
                select c.cedula as cedula_cliente,
                       c.nombre_completo as nombre_cliente,
                       coalesce(sum(v.valor_total_con_iva), 0) as total_compras
                from clientes c
                left join ventas v on v.cedula_cliente = c.cedula
                group by c.cedula, c.nombre_completo
                order by c.nombre_completo asc
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new VentasPorClienteResponse(
                rs.getLong("cedula_cliente"),
                rs.getString("nombre_cliente"),
                rs.getBigDecimal("total_compras")));
    }

    public BigDecimal totalConsolidadoVentas(List<VentasPorClienteResponse> detalle) {
        return detalle.stream()
                .map(VentasPorClienteResponse::getTotalCompras)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
