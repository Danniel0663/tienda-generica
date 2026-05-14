export const SESSION_KEY = 'tg.react.session';
export const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,60}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export function formatCurrency(value) {
  return `$${moneyFormatter.format(Number(value || 0))}`;
}

export function formatNumber(value) {
  return moneyFormatter.format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return dateTimeFormatter.format(parsed);
}

export function isSessionExpired(session) {
  if (!session?.expiraEn) {
    return true;
  }

  const expiration = new Date(session.expiraEn);
  return Number.isNaN(expiration.getTime()) || expiration <= new Date();
}

export function loadStoredSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (isSessionExpired(parsed)) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function persistSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getInitials(value) {
  return String(value || 'TG')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join('');
}

export function extractErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error.payload && typeof error.payload === 'object') {
    return error.payload.message || error.payload.error || fallback;
  }

  return fallback;
}

export function getServerFieldErrors(error) {
  if (error?.payload && typeof error.payload === 'object') {
    return error.payload.fieldErrors || {};
  }

  return {};
}

export function matchesQuery(item, fields, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return fields.some((field) =>
    String(item[field] || '')
      .toLowerCase()
      .includes(normalized)
  );
}

export function requireValue(value, message) {
  return String(value ?? '').trim() ? '' : message;
}

export function validateEmail(value, message) {
  return EMAIL_REGEX.test(String(value || '').trim()) ? '' : message;
}

export function validatePhone(value, message) {
  return PHONE_REGEX.test(String(value || '').trim()) ? '' : message;
}

export function validateUsername(value, message) {
  return USERNAME_REGEX.test(String(value || '').trim()) ? '' : message;
}

export function validatePositiveInteger(value, message) {
  return Number.isInteger(Number(value)) && Number(value) > 0 ? '' : message;
}

export function validatePositiveDecimal(value, message) {
  return Number(value) > 0 ? '' : message;
}

export function validateRange(value, min, max, message) {
  const numeric = Number(value);
  return numeric >= min && numeric <= max ? '' : message;
}

export function createFormData(file) {
  const formData = new FormData();
  formData.append('archivo', file);
  return formData;
}
