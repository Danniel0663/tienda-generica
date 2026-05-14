package com.tiendagenerica.api.util;

import java.util.Locale;

public final class InputSanitizer {

    private InputSanitizer() {
    }

    public static String normalize(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    public static String normalizeLowerCase(String value) {
        String normalized = normalize(value);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }
}
