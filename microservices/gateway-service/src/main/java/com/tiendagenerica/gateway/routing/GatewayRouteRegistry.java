package com.tiendagenerica.gateway.routing;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GatewayRouteRegistry {

    private final List<RouteTargetPool> routePools;

    public GatewayRouteRegistry(
            @Value("${services.usuarios.base-urls:${services.usuarios.base-url:http://localhost:8082}}")
            String usuariosBaseUrls,
            @Value("${services.clientes.base-urls:${services.clientes.base-url:http://localhost:8083}}")
            String clientesBaseUrls,
            @Value("${services.proveedores.base-urls:${services.proveedores.base-url:http://localhost:8084}}")
            String proveedoresBaseUrls,
            @Value("${services.productos.base-urls:${services.productos.base-url:http://localhost:8085}}")
            String productosBaseUrls,
            @Value("${services.ventas.base-urls:${services.ventas.base-url:http://localhost:8086}}")
            String ventasBaseUrls,
            @Value("${services.reportes.base-urls:${services.reportes.base-url:http://localhost:8087}}")
            String reportesBaseUrls) {
        this.routePools = List.of(
                new RouteTargetPool("/api/auth", "usuarios-service", usuariosBaseUrls),
                new RouteTargetPool("/api/usuarios", "usuarios-service", usuariosBaseUrls),
                new RouteTargetPool("/api/clientes", "clientes-service", clientesBaseUrls),
                new RouteTargetPool("/api/proveedores", "proveedores-service", proveedoresBaseUrls),
                new RouteTargetPool("/api/productos", "productos-service", productosBaseUrls),
                new RouteTargetPool("/api/ventas", "ventas-service", ventasBaseUrls),
                new RouteTargetPool("/api/reportes", "report-service", reportesBaseUrls));
    }

    public RouteTargetPool resolve(String requestPath) {
        return routePools.stream()
                .filter(route -> route.matches(requestPath))
                .findFirst()
                .orElse(null);
    }
}
