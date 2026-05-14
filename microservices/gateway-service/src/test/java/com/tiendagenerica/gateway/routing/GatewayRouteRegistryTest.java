package com.tiendagenerica.gateway.routing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;
import org.junit.jupiter.api.Test;

class GatewayRouteRegistryTest {

    @Test
    void shouldResolveConfiguredRoute() {
        GatewayRouteRegistry registry = new GatewayRouteRegistry(
                "http://usuarios-a:8082,http://usuarios-b:8082",
                "http://clientes-a:8083",
                "http://proveedores-a:8084",
                "http://productos-a:8085",
                "http://ventas-a:8086",
                "http://reportes-a:8087");

        RouteTargetPool route = registry.resolve("/api/usuarios/1090");

        assertNotNull(route);
        assertEquals("usuarios-service", route.serviceName());
    }

    @Test
    void shouldReturnNullForUnknownRoute() {
        GatewayRouteRegistry registry = new GatewayRouteRegistry(
                "http://usuarios-a:8082",
                "http://clientes-a:8083",
                "http://proveedores-a:8084",
                "http://productos-a:8085",
                "http://ventas-a:8086",
                "http://reportes-a:8087");

        assertNull(registry.resolve("/api/inexistente"));
    }

    @Test
    void shouldRotateConfiguredInstancesInRoundRobinOrder() {
        RouteTargetPool route = new RouteTargetPool(
                "/api/productos",
                "productos-service",
                List.of("http://productos-a:8085", "http://productos-b:8085"));

        assertEquals(
                List.of("http://productos-a:8085", "http://productos-b:8085"),
                route.orderedBaseUrls());
        assertEquals(
                List.of("http://productos-b:8085", "http://productos-a:8085"),
                route.orderedBaseUrls());
        assertEquals(
                List.of("http://productos-a:8085", "http://productos-b:8085"),
                route.orderedBaseUrls());
    }

    @Test
    void shouldNormalizeConfiguredUrls() {
        assertEquals(
                List.of("http://ventas-a:8086", "http://ventas-b:8086"),
                RouteTargetPool.parseBaseUrls("http://ventas-a:8086/, http://ventas-b:8086/"));
    }
}
