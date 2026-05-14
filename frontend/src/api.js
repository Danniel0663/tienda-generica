const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function parsePayload(response) {
  if (response.status === 204) {
    return Promise.resolve(null);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function resolveMessage(payload, fallback) {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (typeof payload === 'object') {
    return payload.message || payload.error || payload.mensaje || fallback;
  }

  return fallback;
}

export function pickInfrastructureTrace(headers) {
  return {
    frontendLoadBalancer: headers.get('x-frontend-load-balancer'),
    frontendUpstream: headers.get('x-frontend-upstream'),
    backendLoadBalancer: headers.get('x-backend-load-balancer'),
    backendUpstream: headers.get('x-backend-upstream'),
    upstreamService: headers.get('x-upstream-service'),
    upstreamInstance: headers.get('x-upstream-instance'),
    updatedAt: new Date().toISOString()
  };
}

export async function apiRequest(
  path,
  { method = 'GET', body, token, onUnauthorized, onTrace, signal } = {}
) {
  const headers = new Headers({
    Accept: 'application/json'
  });

  const options = {
    method,
    headers,
    signal
  };

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    const networkError = new Error('No fue posible comunicarse con la API.');
    networkError.cause = error;
    throw networkError;
  }

  const data = await parsePayload(response);
  const trace = pickInfrastructureTrace(response.headers);
  onTrace?.(trace);

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
    }

    const requestError = new Error(
      resolveMessage(data, `La solicitud falló con estado ${response.status}.`)
    );
    requestError.status = response.status;
    requestError.payload = data;
    requestError.trace = trace;
    throw requestError;
  }

  return { data, headers: response.headers, trace };
}
