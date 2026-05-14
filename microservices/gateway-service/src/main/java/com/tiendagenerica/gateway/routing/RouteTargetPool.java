package com.tiendagenerica.gateway.routing;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

public final class RouteTargetPool {

    private final String routePrefix;
    private final String serviceName;
    private final List<String> baseUrls;
    private final AtomicInteger cursor = new AtomicInteger();

    public RouteTargetPool(String routePrefix, String serviceName, String configuredBaseUrls) {
        this(routePrefix, serviceName, parseBaseUrls(configuredBaseUrls));
    }

    RouteTargetPool(String routePrefix, String serviceName, List<String> baseUrls) {
        this.routePrefix = Objects.requireNonNull(routePrefix, "routePrefix no puede ser null");
        this.serviceName = Objects.requireNonNull(serviceName, "serviceName no puede ser null");
        if (baseUrls == null || baseUrls.isEmpty()) {
            throw new IllegalArgumentException("Debe existir al menos una URL configurada para " + serviceName);
        }
        this.baseUrls = List.copyOf(baseUrls);
    }

    public boolean matches(String requestPath) {
        return requestPath != null && requestPath.startsWith(routePrefix);
    }

    public List<String> orderedBaseUrls() {
        if (baseUrls.size() == 1) {
            return baseUrls;
        }

        int startIndex = Math.floorMod(cursor.getAndIncrement(), baseUrls.size());
        List<String> orderedUrls = new ArrayList<>(baseUrls.size());
        for (int offset = 0; offset < baseUrls.size(); offset++) {
            orderedUrls.add(baseUrls.get((startIndex + offset) % baseUrls.size()));
        }
        return List.copyOf(orderedUrls);
    }

    public String serviceName() {
        return serviceName;
    }

    static List<String> parseBaseUrls(String configuredBaseUrls) {
        if (configuredBaseUrls == null || configuredBaseUrls.isBlank()) {
            throw new IllegalArgumentException("La configuracion de URLs no puede estar vacia");
        }

        List<String> urls = new ArrayList<>();
        for (String rawValue : configuredBaseUrls.split(",")) {
            String trimmed = rawValue.trim();
            if (!trimmed.isBlank()) {
                urls.add(trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed);
            }
        }

        if (urls.isEmpty()) {
            throw new IllegalArgumentException("No se encontraron URLs validas en la configuracion");
        }

        return List.copyOf(urls);
    }
}
