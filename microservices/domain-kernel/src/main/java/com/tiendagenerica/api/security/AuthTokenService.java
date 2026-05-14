package com.tiendagenerica.api.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendagenerica.api.config.SecurityProperties;
import com.tiendagenerica.api.entity.Usuario;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final SecurityProperties securityProperties;

    public AuthTokenService(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    public GeneratedToken generateFor(Usuario usuario) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(securityProperties.getTokenTtl());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", usuario.getUsuario());
        payload.put("uid", usuario.getCedula());
        payload.put("name", usuario.getNombreCompleto());
        payload.put("iat", issuedAt.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"TGV\"}");
        String encodedPayload = base64Url(writeJson(payload));
        String unsignedToken = header + "." + encodedPayload;
        String signature = base64Url(sign(unsignedToken));
        return new GeneratedToken(unsignedToken + "." + signature, expiresAt);
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

    private String writeJson(Map<String, Object> payload) {
        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (Exception ex) {
            throw new IllegalStateException("No fue posible serializar el token", ex);
        }
    }

    private byte[] sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    securityProperties.getTokenSecret().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("No fue posible firmar el token", ex);
        }
    }

    private String base64Url(String value) {
        return base64Url(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
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

    public record GeneratedToken(String token, Instant expiresAt) {
    }
}
