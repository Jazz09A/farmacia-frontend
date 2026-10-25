/**
 * Cliente HTTP compartido (Fase 1 / ADR-001): origen API + resolución de URLs + keys de auth.
 * - Única fuente de AUTH_STORAGE_KEYS (`auth_token` / `auth_user`, etc.)
 * - DEV: getApiOrigin() = '' → proxy Vite `/api`; PROD: VITE_API_URL
 * - publicFetch para llamadas sin auth; AuthService.authenticatedFetch para sesión (refresh/cola 401)
 * - No reintroducir clientes HTTP paralelos ni keys de storage distintas
 */

/** Keys de localStorage — única fuente de verdad (alineadas con AuthService). */
export const AUTH_STORAGE_KEYS = {
  token: 'auth_token',
  refreshToken: 'refresh_token',
  tokenExpiry: 'token_expiry',
  user: 'auth_user',
} as const;

/**
 * Origen del API:
 * - DEV: '' para usar el proxy de Vite (`/api` → backend)
 * - PROD: VITE_API_URL (sin trailing slash)
 */
export function getApiOrigin(): string {
  if (import.meta.env.DEV) {
    return '';
  }
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return raw.replace(/\/$/, '');
}

/**
 * Resuelve un path o URL a la URL final a usar con fetch.
 * - Paths absolutos http(s) se dejan igual
 * - Paths relativos se prefijan con getApiOrigin()
 */
export function resolveApiUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return getApiOrigin();
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getApiOrigin()}${path}`;
}

/** Prefijo de API v1 (path relativo, proxy-friendly). */
export const API_V1 = '/api/v1';

export function apiV1(path: string = ''): string {
  if (!path) return API_V1;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_V1}${normalized}`;
}

/** fetch público (sin auth) con resolución de URL consistente. */
export async function publicFetch(
  pathOrUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = resolveApiUrl(pathOrUrl);
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };
  if (!(options.body instanceof FormData) && !(headers as Record<string, string>)['Content-Type']) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...options, headers });
}
