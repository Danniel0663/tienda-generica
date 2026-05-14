package com.tiendagenerica.report.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final String tokenSecret;

    public AuthTokenService(@Value("${app.security.token-secret}") String tokenSecret) {
        this.tokenSecret = tokenSecret;
    }

    public AuthenticatedUser authenticate(String rawToken) {
        String token = rawToken == null ? "" : rawToken.trim();
        if (token.isEmpty()) {
            throw new BadCredentialsException("Token ausente");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BadCredentialsException("Token inválido");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        byte[] expectedSignature = sign(unsignedToken);
        byte[] incomingSignature = decodeBase64(parts[2]);
        if (!MessageDigest.isEqual(expectedSignature, incomingSignature)) {
            throw new BadCredentialsException("Token inválido");
        }

        Map<String, Object> payload = readPayload(parts[1]);
        Instant expiresAt = Instant.ofEpochSecond(readLong(payload, "exp"));
        if (Instant.now().isAfter(expiresAt)) {
            throw new BadCredentialsException("La sesión expiró");
        }

        return new AuthenticatedUser(
                readLong(payload, "uid"),
                readString(payload, "sub"),
                readString(payload, "name"));
    }

    private Map<String, Object> readPayload(String payloadPart) {
        try {
            byte[] jsonBytes = decodeBase64(payloadPart);
            return OBJECT_MAPPER.readValue(jsonBytes, MAP_TYPE);
        } catch (Exception ex) {
            throw new BadCredentialsException("Token inválido");
        }
    }

    private byte[] sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("No fue posible validar el token", ex);
        }
    }

    private byte[] decodeBase64(String value) {
        try {
            return Base64.getUrlDecoder().decode(value);
        } catch (IllegalArgumentException ex) {
            throw new BadCredentialsException("Token inválido");
        }
    }

    private long readLong(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new BadCredentialsException("Token inválido");
    }

    private String readString(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        throw new BadCredentialsException("Token inválido");
    }
}
