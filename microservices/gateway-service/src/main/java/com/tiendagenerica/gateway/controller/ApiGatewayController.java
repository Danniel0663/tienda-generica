package com.tiendagenerica.gateway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendagenerica.gateway.routing.GatewayRouteRegistry;
import com.tiendagenerica.gateway.routing.RouteTargetPool;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@RestController
public class ApiGatewayController {

    private static final Logger log = LoggerFactory.getLogger(ApiGatewayController.class);

    private final RestClient restClient;
    private final GatewayRouteRegistry routeRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiGatewayController(GatewayRouteRegistry routeRegistry) {
        this.restClient = RestClient.create();
        this.routeRegistry = routeRegistry;
    }

    @RequestMapping("/api/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request) throws IOException {
        String path = request.getRequestURI();
        String query = request.getQueryString();
        RouteTargetPool targetPool = routeRegistry.resolve(path);
        if (targetPool == null) {
            return gatewayError(HttpStatus.NOT_FOUND, "No existe una ruta configurada en el gateway para " + path);
        }

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        byte[] body = StreamUtils.copyToByteArray(request.getInputStream());

        ResourceAccessException accessException = null;
        RestClientException clientException = null;
        List<String> candidateBaseUrls = targetPool.orderedBaseUrls();

        for (String targetBase : candidateBaseUrls) {
            try {
                return forwardRequest(request, method, body, path, query, targetPool, targetBase);
            } catch (ResourceAccessException ex) {
                accessException = ex;
                log.warn("No se pudo alcanzar {} en {}", targetPool.serviceName(), targetBase);
            } catch (RestClientException ex) {
                clientException = ex;
                log.warn("Error comunicando con {} en {}", targetPool.serviceName(), targetBase);
            }
        }

        if (accessException != null) {
            return gatewayError(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de destino no está disponible temporalmente");
        }

        if (clientException != null) {
            return gatewayError(
                    HttpStatus.BAD_GATEWAY,
                    "El gateway no pudo completar la comunicación con el servicio de destino");
        }

        return gatewayError(HttpStatus.BAD_GATEWAY, "No fue posible seleccionar una instancia de destino");
    }

    private ResponseEntity<byte[]> forwardRequest(
            HttpServletRequest request,
            HttpMethod method,
            byte[] body,
            String path,
            String query,
            RouteTargetPool targetPool,
            String targetBase) {
        String targetUrl = targetBase + path + (query == null ? "" : "?" + query);
        RestClient.RequestBodySpec requestSpec = restClient.method(method)
                .uri(targetUrl)
                .headers(headers -> copyHeaders(request, headers));

        if (body.length > 0 && supportsBody(method)) {
            requestSpec = requestSpec.body(body);
        }

        return requestSpec.exchange((proxyRequest, proxyResponse) -> {
            HttpHeaders headers = filterResponseHeaders(proxyResponse.getHeaders());
            headers.set("X-Upstream-Service", targetPool.serviceName());
            headers.set("X-Upstream-Instance", targetBase);
            byte[] responseBody = StreamUtils.copyToByteArray(proxyResponse.getBody());
            return ResponseEntity.status(proxyResponse.getStatusCode())
                    .headers(headers)
                    .body(responseBody);
        });
    }

    private boolean supportsBody(HttpMethod method) {
        return method == HttpMethod.POST
                || method == HttpMethod.PUT
                || method == HttpMethod.PATCH
                || method == HttpMethod.DELETE;
    }

    private void copyHeaders(HttpServletRequest request, HttpHeaders targetHeaders) {
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            if (HttpHeaders.HOST.equalsIgnoreCase(name)
                    || HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(name)
                    || HttpHeaders.CONNECTION.equalsIgnoreCase(name)) {
                continue;
            }

            Enumeration<String> values = request.getHeaders(name);
            while (values.hasMoreElements()) {
                targetHeaders.add(name, values.nextElement());
            }
        }
    }

    private HttpHeaders filterResponseHeaders(HttpHeaders source) {
        HttpHeaders headers = new HttpHeaders();
        source.forEach((key, values) -> {
            if (!HttpHeaders.TRANSFER_ENCODING.equalsIgnoreCase(key)) {
                headers.put(key, values);
            }
        });
        return headers;
    }

    private ResponseEntity<byte[]> gatewayError(HttpStatus status, String message) throws IOException {
        byte[] body = objectMapper.writeValueAsString(Map.of(
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message)).getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body);
    }
}
